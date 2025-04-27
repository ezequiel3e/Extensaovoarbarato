// Arquivo: init-reserva.js
// Script de inicialização para a página reserva.html

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de reserva carregada');
    console.log('Ambiente atual:', window.location.href);

    // Verificar se os elementos necessários estão disponíveis
    const formReserva = document.getElementById('form-reserva');
    if (formReserva) {
        console.log('Formulário de reserva encontrado, inicializando');
    } else {
        console.error('Formulário de reserva não encontrado');
    }
});