// background.js - Script de fundo da extensão
console.log('Background script carregado!');

// Listener para mensagens de outros scripts da extensão
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensagem recebida no background:', request);

    if (request.action === 'searchFlights') {
        const { origin, destination, date, adults, cabinClass } = request.params;

        // URL do backend - corrigindo com a URL exata do Vercel
        const urls = [
            'https://voarbarato-backend.vercel.app/api/flights',
            'https://voarbarato-backend-cms256xom-esequiels-projects-73c4d6a0.vercel.app/api/flights'
        ];

        const backendUrl = urls[0]; // Primeira opção

        console.log('Tentando acessar:', backendUrl);
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
                console.log('Status da resposta:', response.status, response.statusText);

                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Corpo da resposta com erro:', text);
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

                // Se a primeira URL falhar, tentar a próxima
                console.log('Tentando URL alternativa...');

                // Função para tentar URL alternativa
                const tryAlternativeUrl = (index) => {
                    if (index >= urls.length) {
                        sendResponse({ success: false, error: "Todas as URLs falharam: " + error.message });
                        return;
                    }

                    console.log('Tentando URL:', urls[index]);

                    fetch(urls[index], {
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
                            console.log('Resposta recebida da URL alternativa:', data);
                            sendResponse({ success: true, data });
                        })
                        .catch(err => {
                            console.error('Erro na URL alternativa:', err);
                            tryAlternativeUrl(index + 1);
                        });
                };

                tryAlternativeUrl(1); // Começar com a segunda URL
            });

        // Importante: retornar true para indicar que a resposta será assíncrona
        return true;
    }
});