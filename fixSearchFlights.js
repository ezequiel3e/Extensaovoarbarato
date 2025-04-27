/**
 * Este script garante que a função searchFlights está disponível globalmente
 * para compatibilidade com outros scripts
 */
console.log('fixSearchFlights.js carregado');

// Importar a função do módulo
import { searchFlights } from './src/services/flightService.js';

// Verificar se a função já está disponível globalmente
if (typeof window.searchFlights !== 'function') {
    console.log('Adicionando searchFlights ao escopo global');

    // Exportar a função para o escopo global
    window.searchFlights = async function(params) {
        console.log('searchFlights chamado via proxy global com parâmetros:', params);

        try {
            // Garantir compatibilidade com parâmetros legados
            const paramsNormalizados = normalizarParametros(params);

            // Chamar a implementação real
            const resultado = await searchFlights(paramsNormalizados);
            return resultado;
        } catch (erro) {
            console.error('Erro na busca de voos:', erro);
            return {
                error: `Erro ao buscar voos: ${erro.message}`,
                results: []
            };
        }
    };
} else {
    console.log('Função searchFlights já está disponível globalmente');
}

/**
 * Normaliza os parâmetros de busca para garantir compatibilidade com código legado
 * @param {Object} params - Parâmetros originais
 * @returns {Object} - Parâmetros normalizados
 */
function normalizarParametros(params) {
    // Clone os parâmetros para não modificar o objeto original
    const paramsNormalizados = {...params };

    // Verificar se os parâmetros usam as nomenclaturas antigas
    if (paramsNormalizados.origem && !paramsNormalizados.origin) {
        paramsNormalizados.origin = paramsNormalizados.origem;
    }

    if (paramsNormalizados.destino && !paramsNormalizados.destination) {
        paramsNormalizados.destination = paramsNormalizados.destino;
    }

    console.log('Parâmetros normalizados:', paramsNormalizados);
    return paramsNormalizados;
}