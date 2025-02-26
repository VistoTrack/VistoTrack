document.addEventListener("DOMContentLoaded", function () {
    // Seleciona os botões
    const loginButton = document.querySelector(".btn-outline");
    const registerButton = document.querySelector(".btn-primary");
    const accessButton = document.querySelector(".hero .btn-primary");

    // Redirecionamento para login
    loginButton.addEventListener("click", function () {
        window.location.href = "login.html";
    });

    // Redirecionamento para cadastro
    registerButton.addEventListener("click", function () {
        window.location.href = "cadastro.html";
    });

    // Redirecionamento para acesso ao sistema
    accessButton.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
});
