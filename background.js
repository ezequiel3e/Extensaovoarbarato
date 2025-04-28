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

        // Primeiro vamos verificar se a API está no ar
        fetch('https://voarbarato-backend.vercel.app/api/test')
            .then(response => {
                if (!response.ok) {
                    console.warn('API de teste não disponível. Status:', response.status);
                    return response.text().then(text => {
                        console.error('Resposta do teste:', text);
                    });
                }
                return response.json().then(data => {
                    console.log('API de teste disponível:', data);
                });
            })
            .catch(error => {
                console.error('Erro ao testar API:', error);
            })
            .finally(() => {
                // Agora vamos testar a conexão com a Amadeus
                fetch('https://voarbarato-backend.vercel.app/api/amadeus-test')
                    .then(response => {
                        if (!response.ok) {
                            console.warn('Teste Amadeus falhou. Status:', response.status);
                            return response.text().then(text => {
                                console.error('Resposta do teste Amadeus:', text);
                            });
                        }
                        return response.json().then(data => {
                            console.log('Teste Amadeus disponível:', data);
                        });
                    })
                    .catch(error => {
                        console.error('Erro ao testar conexão Amadeus:', error);
                    })
                    .finally(() => {
                        // Agora fazemos a busca de voos independentemente do resultado dos testes
                        // Fazer a requisição HTTP para busca de voos
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
                                        // Melhorar a mensagem de erro e não lançar exceção
                                        sendResponse({
                                            success: false,
                                            error: `Erro na API: ${response.status} - ${text || response.statusText}`
                                        });
                                    });
                                }
                                return response.json();
                            })
                            .then(data => {
                                if (data) { // Verificar se data existe antes de prosseguir
                                    console.log('Resposta recebida:', data);
                                    sendResponse({ success: true, data });
                                }
                            })
                            .catch(error => {
                                console.error('Erro na requisição:', error);

                                // Se a primeira URL falhar, tentar a próxima
                                console.log('Tentando URL alternativa...');

                                // Função para tentar URL alternativa
                                const tryAlternativeUrl = (index) => {
                                    if (index >= urls.length) {
                                        sendResponse({
                                            success: false,
                                            error: "Todas as URLs falharam: " + error.message
                                        });
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
                                                    console.error('Erro na URL alternativa:', text);
                                                    // Continuar tentando a próxima URL em vez de lançar erro
                                                    tryAlternativeUrl(index + 1);
                                                    return null; // Retornar null para evitar processar .then(data =>...)
                                                });
                                            }
                                            return response.json();
                                        })
                                        .then(data => {
                                            if (data) { // Se data existe (não é null)
                                                console.log('Resposta recebida da URL alternativa:', data);
                                                sendResponse({ success: true, data });
                                            }
                                        })
                                        .catch(err => {
                                            console.error('Erro na URL alternativa:', err);
                                            tryAlternativeUrl(index + 1);
                                        });
                                };

                                tryAlternativeUrl(1); // Começar com a segunda URL
                            });
                    });
            });

        // Importante: retornar true para indicar que a resposta será assíncrona
        return true;
    }
});