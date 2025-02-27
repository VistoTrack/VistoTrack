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

        // Criptografar senha antes de enviá-la ao backend
        const encryptedPassword = await encryptPassword(senha);

        // Exibir indicador de carregamento
        showLoading(true);

        try {
            // Obter token CSRF
            const csrfToken = getCsrfToken();

            // Enviar os dados ao backend
            const response = await fetch(getApiUrl("/auth/register"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify({ nome, email, telefone, senha: encryptedPassword })
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
 * Função para criptografar a senha antes de enviá-la ao backend.
 */
async function encryptPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer))); // Converte para Base64
}
