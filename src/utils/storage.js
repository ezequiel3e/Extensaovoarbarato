/**
 * Utilitário para gerenciar o armazenamento de dados da busca
 */

// Chaves para armazenamento no localStorage
const STORAGE_KEYS = {
    ULTIMA_BUSCA: 'voarbarato_ultima_busca',
    ULTIMOS_RESULTADOS: 'voarbarato_ultimos_resultados'
};

/**
 * Salva os dados da última busca
 * @param {Object} params - Parâmetros da busca
 * @param {string} origemTexto - Texto completo do campo origem
 * @param {string} destinoTexto - Texto completo do campo destino
 */
export function salvarUltimaBusca(params, origemTexto, destinoTexto) {
    try {
        localStorage.setItem(STORAGE_KEYS.ULTIMA_BUSCA, JSON.stringify({
            origem: {
                codigo: params.origin,
                texto: origemTexto
            },
            destino: {
                codigo: params.destination,
                texto: destinoTexto
            },
            data: params.date,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Erro ao salvar última busca:', error);
    }
}

/**
 * Salva os resultados da última busca
 * @param {Array} voos - Lista de voos encontrados
 */
export function salvarUltimosResultados(voos) {
    try {
        localStorage.setItem(STORAGE_KEYS.ULTIMOS_RESULTADOS, JSON.stringify({
            voos,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Erro ao salvar últimos resultados:', error);
    }
}

/**
 * Carrega os dados da última busca
 * @returns {Object|null} Dados da última busca ou null se não existir/expirado
 */
export function carregarUltimaBusca() {
    try {
        const ultimaBuscaStr = localStorage.getItem(STORAGE_KEYS.ULTIMA_BUSCA);
        if (!ultimaBuscaStr) return null;

        const ultimaBusca = JSON.parse(ultimaBuscaStr);

        // Verificar se os dados não estão muito antigos (24 horas)
        const agora = Date.now();
        const horasPassadas = (agora - ultimaBusca.timestamp) / (1000 * 60 * 60);

        if (horasPassadas > 24) {
            console.log('Dados da última busca muito antigos, removendo...');
            limparDadosSalvos();
            return null;
        }

        return ultimaBusca;
    } catch (error) {
        console.error('Erro ao carregar última busca:', error);
        return null;
    }
}

/**
 * Carrega os últimos resultados
 * @returns {Object|null} Últimos resultados ou null se não existir/expirado
 */
export function carregarUltimosResultados() {
    try {
        const ultimosResultadosStr = localStorage.getItem(STORAGE_KEYS.ULTIMOS_RESULTADOS);
        if (!ultimosResultadosStr) return null;

        const dados = JSON.parse(ultimosResultadosStr);

        // Verificar se os dados não estão muito antigos (24 horas)
        const agora = Date.now();
        const horasPassadas = (agora - dados.timestamp) / (1000 * 60 * 60);

        if (horasPassadas > 24) {
            console.log('Resultados muito antigos, removendo...');
            limparDadosSalvos();
            return null;
        }

        return dados;
    } catch (error) {
        console.error('Erro ao carregar últimos resultados:', error);
        return null;
    }
}

/**
 * Limpa todos os dados salvos
 */
export function limparDadosSalvos() {
    try {
        localStorage.removeItem(STORAGE_KEYS.ULTIMA_BUSCA);
        localStorage.removeItem(STORAGE_KEYS.ULTIMOS_RESULTADOS);
    } catch (error) {
        console.error('Erro ao limpar dados salvos:', error);
    }
}