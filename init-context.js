// Arquivo: init-context.js
// Script de inicialização específico para a página contexto.html

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de contexto carregada');

    // Verificar ambiente
    console.log('Ambiente atual:', window.location.href);

    // Outras inicializações específicas do contexto
    const contextoDetalhes = document.getElementById('contexto-detalhes');
    if (contextoDetalhes) {
        console.log('Elemento contexto-detalhes encontrado, inicializando dados');
    }
});