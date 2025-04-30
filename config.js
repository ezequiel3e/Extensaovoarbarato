export const config = {
    API: {
        // Valores fixos para uso na extensão Chrome
        // Não usar process.env aqui porque não está disponível no ambiente da extensão
        BASE_URL: 'https://api.amadeus.com/v2',
        TOKEN_URL: 'https://api.amadeus.com/v1/security/oauth2/token',

        // ATENÇÃO: NÃO armazenar credenciais no código da extensão!
        // Deixar vazio e usar apenas o backend para autenticação
        CLIENT_ID: '',
        CLIENT_SECRET: ''
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

// Não é necessário validar CLIENT_ID e CLIENT_SECRET aqui
// A validação será feita no backend
console.log('Configuração carregada para extensão.');