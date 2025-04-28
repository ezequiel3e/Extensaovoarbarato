// background.js - Script de fundo da extensão
console.log('Background script carregado!');

// Listener para mensagens de outros scripts da extensão
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensagem recebida no background:', request);

    if (request.action === 'searchFlights') {
        const { origin, destination, date, adults, cabinClass } = request.params;

        // URL do backend - corrigindo para garantir o caminho correto
        const backendUrl = 'https://voarbarato-backend.vercel.app/api/flights';

        console.log('Enviando requisição para:', backendUrl);
        console.log('Parâmetros:', { origin, destination, date, adults, cabinClass });

        // Fazer a requisição HTTP
        fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ origin, destination, date, adults, cabinClass })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error('Erro na resposta: ' + text);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Resposta recebida:', data);
                sendResponse({ success: true, data });
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                sendResponse({ success: false, error: error.message });
            });

        // Importante: retornar true para indicar que a resposta será assíncrona
        return true;
    }
});