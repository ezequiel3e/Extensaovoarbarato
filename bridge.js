/**
 * Script de ponte entre módulos ES6 e scripts regulares
 * Este arquivo expõe funções dos módulos ES6 como variáveis globais
 * para que scripts antigos possam acessá-las
 */
console.log('🔌 bridge.js: Carregando script de conexão entre módulos...');

// Importar as funções necessárias dos módulos ES6
import { searchFlights } from './src/services/flightService.js';
import {
    validarCodigoIATA,
    extrairCodigoIATA,
    normalizarParametroBusca,
    obterNomeAeroporto,
    CODIGOS_IATA_BR
} from './src/utils/validacao.js';
import {
    inicializarSugestoes,
    mostrarSugestoes
} from './src/utils/sugestoes.js';
import {
    inicializarControladorBusca,
    realizarBusca
} from './src/controllers/buscaController.js';
import {
    criarCartaoVoo,
    exibirErro
} from './src/utils/flightDisplay.js';

// Funções que serão expostas globalmente
const exposedFunctions = {
    // API de voos
    searchFlights,

    // Validação
    validarCodigoIATA,
    extrairCodigoIATA,
    normalizarParametroBusca,
    obterNomeAeroporto,
    CODIGOS_IATA_BR,

    // Sugestões
    inicializarSugestoes,
    mostrarSugestoes,

    // Controlador de busca
    inicializarControladorBusca,
    realizarBusca,
    buscarVoos: realizarBusca, // Alias para compatibilidade

    // Exibição de resultados
    criarCartaoVoo,
    exibirErro
};

// Expor as funções globalmente
Object.entries(exposedFunctions).forEach(([name, func]) => {
    if (typeof func !== 'undefined') {
        window[name] = func;
        console.log(`✅ bridge.js: Função ${name} exposta globalmente`);
    } else {
        console.error(`❌ bridge.js: Função ${name} não encontrada para exposição global`);
    }
});

// Verificar se as principais funções foram expostas corretamente
const requiredFunctions = ['searchFlights', 'mostrarSugestoes', 'realizarBusca', 'criarCartaoVoo'];
const missingFunctions = requiredFunctions.filter(funcName => typeof window[funcName] !== 'function');

if (missingFunctions.length > 0) {
    console.error(`❌ bridge.js: As seguintes funções essenciais não foram expostas corretamente: ${missingFunctions.join(', ')}`);
} else {
    console.log('✅ bridge.js: Todas as funções essenciais foram expostas com sucesso!');
}

// Executar inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 bridge.js: Inicializando aplicação...');

        // Inicializar componentes
        if (typeof inicializarSugestoes === 'function') {
            inicializarSugestoes();
        }

        if (typeof inicializarControladorBusca === 'function') {
            inicializarControladorBusca();
        }

        console.log('✅ bridge.js: Inicialização concluída!');

        // Disparar evento de inicialização concluída para outros scripts
        const event = new CustomEvent('modulesInitialized', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('❌ bridge.js: Erro durante a inicialização:', error);
    }
});