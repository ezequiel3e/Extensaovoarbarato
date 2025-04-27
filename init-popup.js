// Arquivo: init-popup.js
// Script de inicialização para o popup

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup carregado');
    console.log('Ambiente atual:', window.location.href);

    // Verificar elementos do popup
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        console.log('Formulário de busca do popup encontrado');
    }
});