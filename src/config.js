export const BACKEND_URL = 'https://voarbarato-backend.vercel.app/api/flights';

// Configurações adicionais
export const config = {
    API: {
        TIMEOUT: 30000, // 30 segundos
        RETRY_ATTEMPTS: 3
    }
};