export const config = {
    API: {
        BASE_URL: process.env.URL_BASE_AMADEUS || 'https://api.amadeus.com/v2',
        TOKEN_URL: process.env.URL_TOKEN_AMADEUS || 'https://api.amadeus.com/v1/security/oauth2/token',
        CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
        CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET
    },
    CACHE: {
        EXPIRY: 1000 * 60 * 60 // 1 hora
    },
    RATE_LIMIT: {
        MAX_REQUESTS: 10,
        TIME_WINDOW: 60000 // 1 minuto em milissegundos
    }
};

// Validação das configurações
if (!config.API.CLIENT_ID || !config.API.CLIENT_SECRET) {
    console.error('Erro: CLIENT_ID e CLIENT_SECRET são obrigatórios');
}