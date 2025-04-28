// Rota para busca de voos
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

module.exports = async(req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder a requisições OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verificar se é uma requisição POST
    if (req.method === 'POST') {
        try {
            const { origin, destination, date, adults = '1', cabinClass = 'ECONOMY' } = req.body;

            // Validar parâmetros obrigatórios
            if (!origin || !destination || !date) {
                return res.status(400).json({
                    error: 'Parâmetros incompletos',
                    message: 'Os parâmetros origin, destination e date são obrigatórios',
                    receivedParams: req.body
                });
            }

            console.log('Buscando voos com parâmetros:', { origin, destination, date, adults, cabinClass });

            // Verificar se as credenciais da Amadeus estão configuradas
            // Tentar ambos os formatos de nome da variável
            const clientId = process.env.AMADEUS_CLIENT_ID || process.env.ID_DO_CLIENTE_AMADEUS;
            const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
                return res.status(500).json({
                    error: 'Configuração incompleta',
                    message: 'Credenciais da Amadeus não configuradas',
                    availableEnvs: Object.keys(process.env)
                });
            }

            // Usar URL personalizada se disponível, ou URL padrão
            const tokenUrl = process.env.URL_TOKEN_AMADEUS || 'https://test.api.amadeus.com/v1/security/oauth2/token';

            // Obter token de acesso da Amadeus
            const tokenResponse = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
            });

            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                console.error('Erro ao obter token da Amadeus:', errorText);
                return res.status(tokenResponse.status).json({
                    error: 'Falha na autenticação',
                    message: 'Não foi possível obter token de acesso da Amadeus',
                    details: errorText
                });
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Usar URL base personalizada se disponível, ou URL padrão
            const baseApiUrl = process.env.URL_BASE_AMADEUS || 'https://test.api.amadeus.com';
            const apiUrl = `${baseApiUrl}/v2/shopping/flight-offers`;

            const queryParams = new URLSearchParams({
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: date,
                adults: adults,
                travelClass: cabinClass,
                currencyCode: 'BRL',
                max: '50'
            });

            console.log('URL da API:', `${apiUrl}?${queryParams}`);

            // Fazer a requisição para a API da Amadeus
            const flightResponse = await fetch(`${apiUrl}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!flightResponse.ok) {
                const errorText = await flightResponse.text();
                console.error('Erro na API da Amadeus:', errorText);
                return res.status(flightResponse.status).json({
                    error: 'Falha na busca de voos',
                    message: 'A API da Amadeus retornou um erro',
                    details: errorText,
                    params: { origin, destination, date, adults, cabinClass }
                });
            }

            // Processar e retornar os dados
            const flightData = await flightResponse.json();
            console.log('Voos encontrados:', flightData.data ? flightData.data.length : 0);

            return res.status(200).json({
                success: true,
                data: flightData,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });

        } catch (error) {
            console.error('Erro ao processar a requisição:', error);
            return res.status(500).json({
                error: 'Erro interno',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    } else {
        // Método não suportado
        return res.status(405).json({
            error: 'Método não permitido',
            message: `O método ${req.method} não é suportado nesta rota`,
            allowedMethods: ['POST', 'OPTIONS']
        });
    }
};