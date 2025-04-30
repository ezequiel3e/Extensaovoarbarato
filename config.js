export const config = {
    API: {
        // ATENÇÃO: Não armazenar credenciais no código da extensão!
        // Todas as chamadas que precisam de autenticação devem ser feitas pelo backend

        // URLs para referência (não são usadas para chamadas diretas)
        BASE_URL: 'https://api.amadeus.com/v2',
        TOKEN_URL: 'https://api.amadeus.com/v1/security/oauth2/token'
    },
    CACHE: {
        EXPIRY: 1000 * 60 * 60 // 1 hora
    },
    RATE_LIMIT: {
        MAX_REQUESTS: 10,
        TIME_WINDOW: 60000 // 1 minuto em milissegundos
    },
    // Usar o backend Vercel para todas as chamadas à API Amadeus
    VERCEL_API: {
        BASE_URL: 'https://voarbarato-backend.vercel.app/api',
        FLIGHTS_ENDPOINT: '/flights',
        TEST_ENDPOINT: '/test',
        AMADEUS_TEST_ENDPOINT: '/amadeus-test'
    }
};

console.log('Configuração carregada para extensão.');