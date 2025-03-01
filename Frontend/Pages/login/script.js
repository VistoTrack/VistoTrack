document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) {
        console.error("Elemento #login-form não encontrado.");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita recarregar a página

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validação dos campos
        if (!username || !password) {
            showAlert("Preencha todos os campos!", "error");
            return;
        }

        if (!validarEmailTelefone(username)) {
            showAlert("Digite um e-mail ou telefone válido!", "error");
            return;
        }

        // Exibir indicador de carregamento
        showLoading(true);

        try {
            // Obter token CSRF
            const csrfToken = getCsrfToken();

            // Fazer requisição de login
            const response = await fetch(getApiUrl("/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Erro na autenticação");
            }

            // Salvar token na sessão
            sessionStorage.setItem("token", data.token);

            // Redirecionar usuário
            window.location.href = "../dashboard_condutor/dashboard.html";

        } catch (error) {
            showAlert(error.message, "error");
        } finally {
            // Esconder indicador de carregamento
            showLoading(false);
        }
    });
});

/**
 * Valida se o input é um e-mail ou telefone válido.
 */
function validarEmailTelefone(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefoneRegex = /^\d{10,11}$/;
    return emailRegex.test(input) || telefoneRegex.test(input);
}

/**
 * Obtém o token CSRF armazenado nos cookies.
 */
function getCsrfToken() {
    return document.cookie.replace(/(?:(?:^|.*;\s*)csrf_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
}

/**
 * Retorna a URL base da API, ajustável por ambiente.
 */
function getApiUrl(endpoint) {
    const BASE_URL = "http://vistotrack.com:8000"; // Definir variável global para facilitar mudanças
    return `${BASE_URL}${endpoint}`;
}

/**
 * Exibe um alerta dinâmico para feedback do usuário.
 */
function showAlert(message, type = "info") {
    alert(message); // Pode ser substituído por um modal ou toast futuramente
}

/**
 * Exibe ou esconde um indicador de carregamento.
 */
function showLoading(isLoading) {
    const button = document.querySelector("#login-form button[type='submit']");
    if (button) {
        button.disabled = isLoading;
        button.innerText = isLoading ? "Aguarde..." : "Entrar";
    }
}
