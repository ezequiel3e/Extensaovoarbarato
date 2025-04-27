// Script para corrigir o formulário

document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando correção do formulário...');

    // Verifica o campo de data e define uma data padrão se estiver vazio
    const inputData = document.getElementById('data');
    if (inputData && !inputData.value) {
        const hoje = new Date();
        inputData.value = hoje.toISOString().split('T')[0];
        console.log('Data padrão definida:', inputData.value);
    }

    // Registra o evento de busca
    const btnBuscar = document.getElementById('buscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const dataInput = document.getElementById('data');

            // Garante que sempre haja uma data
            if (dataInput && !dataInput.value) {
                const hoje = new Date();
                dataInput.value = hoje.toISOString().split('T')[0];
                console.log('Data definida automaticamente antes da busca:', dataInput.value);
            }

            console.log('Busca iniciada');
        });
    }
});