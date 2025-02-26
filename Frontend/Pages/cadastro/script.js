document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registration-form");

    if (!form) {
        console.error("Elemento #registration-form não encontrado.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita o recarregamento da página

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const confirmarSenha = document.getElementById("confirmar-senha").value.trim();

        // Validações Básicas
        if (!nome || !email || !telefone || !senha || !confirmarSenha) {
            showAlert("Preencha todos os campos!", "error");
            return;
        }

        if (!validarEmail(email)) {
            showAlert("Digite um e-mail válido!", "error");
            return;
        }

        if (!validarTelefone(telefone)) {
            showAlert("Digite um telefone válido! (somente números)", "error");
            return;
        }

        if (senha.length < 8) {
            showAlert("A senha deve ter pelo menos 8 caracteres!", "error");
            return;
        }

        if (senha !== confirmarSenha) {
            showAlert("As senhas não coincidem!", "error");
            return;
        }

        // Exibir indicador de carregamento
        showLoading(true);

        try {
            // Obter token CSRF
            const csrfToken = getCsrfToken();

            // Enviar os dados ao backend
            const response = await fetch(getApiUrl("/register"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify({ nome, email, telefone, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro no cadastro");
            }

            // Redireciona para a tela de login
            showAlert("Cadastro realizado com sucesso!", "success");
            setTimeout(() => {
                window.location.href = "../Login/login.html";
            }, 2000);

        } catch (error) {
            showAlert(error.message, "error");
        } finally {
            // Esconder indicador de carregamento
            showLoading(false);
        }
    });
});

/**
 * Valida um e-mail com regex.
 */
function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida um telefone (somente números, com 10 ou 11 dígitos).
 */
function validarTelefone(telefone) {
    const telefoneRegex = /^\d{10,11}$/;
    return telefoneRegex.test(telefone);
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
    const BASE_URL = "http://vistotrack.com:5000";
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
    const button = document.querySelector("#registration-form button[type='submit']");
    if (button) {
        button.disabled = isLoading;
        button.innerText = isLoading ? "Cadastrando..." : "Cadastrar";
    }
}
