// api/index.js - Rota raiz da API
module.exports = (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Retornar informações sobre a API
    res.status(200).json({
        name: 'Voo Barato API',
        version: '1.0.0',
        description: 'API para busca de voos baratos',
        endpoints: {
            test: {
                url: '/api/test',
                method: 'GET',
                description: 'Verifica se a API está funcionando'
            },
            amadeusTest: {
                url: '/api/amadeus-test',
                method: 'GET',
                description: 'Verifica a conexão com a API da Amadeus e as credenciais'
            },
            flights: {
                url: '/api/flights',
                method: 'POST',
                description: 'Busca voos com base nos parâmetros',
                parameters: {
                    origin: 'Código IATA do aeroporto de origem (ex: GRU)',
                    destination: 'Código IATA do aeroporto de destino (ex: REC)',
                    date: 'Data no formato YYYY-MM-DD',
                    adults: 'Número de adultos (padrão: 1)',
                    cabinClass: 'Classe da cabine (padrão: ECONOMY)'
                }
            }
        }
    });
};