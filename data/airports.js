import { config } from '../config.js';

export const airports = [
    { codigo: 'GRU', nome: 'Aeroporto Internacional de São Paulo/Guarulhos' },
    { codigo: 'CGH', nome: 'Aeroporto de Congonhas' },
    { codigo: 'BSB', nome: 'Aeroporto Internacional de Brasília' },
    { codigo: 'GIG', nome: 'Aeroporto Internacional do Rio de Janeiro/Galeão' },
    { codigo: 'SDU', nome: 'Aeroporto Santos Dumont' },
    { codigo: 'CNF', nome: 'Aeroporto Internacional de Confins' },
    { codigo: 'VCP', nome: 'Aeroporto Internacional de Viracopos' },
    { codigo: 'SSA', nome: 'Aeroporto Internacional de Salvador' },
    { codigo: 'REC', nome: 'Aeroporto Internacional do Recife' },
    { codigo: 'FOR', nome: 'Aeroporto Internacional de Fortaleza' }
];

// Cache para armazenar resultados de busca frequentes
const searchCache = new Map();

export function searchAirports(query) {
    const cacheKey = query.toLowerCase();

    // Verificar cache
    if (searchCache.has(cacheKey)) {
        const { results, timestamp } = searchCache.get(cacheKey);
        if (Date.now() - timestamp < config.CACHE.EXPIRY) {
            return results;
        }
        searchCache.delete(cacheKey);
    }

    // Implementar busca otimizada usando índice de palavras-chave
    const results = airports.filter(airport =>
        airport.nome.toLowerCase().includes(cacheKey) ||
        airport.codigo.toLowerCase().includes(cacheKey)
    );

    // Armazenar no cache
    searchCache.set(cacheKey, {
        results,
        timestamp: Date.now()
    });

    return results;
}

// Limpar cache periodicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > config.CACHE.EXPIRY) {
            searchCache.delete(key);
        }
    }
}, config.CACHE.EXPIRY);