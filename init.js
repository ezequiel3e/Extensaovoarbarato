/**
 * Script de inicialização do aplicativo Voo Barato
 * Este arquivo carrega os módulos essenciais e configura o estado inicial
 */
console.log('🚀 Inicializando aplicativo Voo Barato...');

// Importar funções globais usadas por scripts externos
// Estas funções são expostas globalmente para compatibilidade com scripts legados
import { searchFlights } from './src/services/flightService.js';
import { inicializarSugestoes, mostrarSugestoes } from './src/utils/sugestoes.js';
import { inicializarControladorBusca, realizarBusca } from './src/controllers/buscaController.js';

// Expor funções necessárias globalmente para compatibilidade
window.searchFlights = searchFlights;
window.mostrarSugestoes = mostrarSugestoes;
window.buscarVoos = realizarBusca;

// Definir função para inicializar o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM carregado, inicializando módulos...');

        // Inicializar componentes do aplicativo
        inicializarSugestoes();
        inicializarControladorBusca();

        // Registrar evento de busca uma única vez
        const btnBuscar = document.getElementById('buscar');
        if (btnBuscar && !btnBuscar.hasAttribute('data-event-registered')) {
            btnBuscar.setAttribute('data-event-registered', 'true');
            btnBuscar.addEventListener('click', async(event) => {
                event.preventDefault();
                console.log('Botão buscar clicado - evento único');
                await realizarBusca();
            });

            // Registrar evento de Enter no formulário
            const searchForm = document.getElementById('search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', async(event) => {
                    event.preventDefault();
                    console.log('Formulário enviado - evento único');
                    await realizarBusca();
                });
            }
        }

        console.log('✅ Inicialização concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante a inicialização:', error);

        // Exibir mensagem de erro para o usuário
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
            <div class="error-message">
                <h3>Erro de inicialização</h3>
                <p>Ocorreu um erro ao inicializar o aplicativo. Por favor, recarregue a página.</p>
                <button onclick="location.reload()">Recarregar</button>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }
});

// Registrar erros globais
window.addEventListener('error', function(event) {
    console.error('Erro capturado:', event.error || event.message);
    console.error('Arquivo:', event.filename);
    console.error('Linha:', event.lineno, 'Coluna:', event.colno);
    console.error('Stack trace:', event.error && event.error.stack);
});

// Registrar erros de promessas não tratadas
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promessa rejeitada não tratada:', event.reason);
    console.error('Stack trace:', event.reason && event.reason.stack);
});

// Verificar se a API está disponível
function verificarDisponibilidadeAPI() {
    console.log('Verificando disponibilidade da API...');

    // Definir timestamp global para controle de inicialização
    window.tempoInicializacao = Date.now();

    // Verificar se o módulo de serviços está disponível
    try {
        const script = document.createElement('script');
        script.src = 'src/services/flightService.js';
        script.type = 'module';
        script.onerror = function(error) {
            console.error('Erro ao carregar o serviço de voos:', error);
        };
        script.onload = function() {
            console.log('Serviço de voos carregado com sucesso!');
        };
        document.head.appendChild(script);
    } catch (error) {
        console.error('Erro ao tentar carregar o serviço de voos:', error);
    }
}

// Definir data mínima para o input de data
function definirDataMinima() {
    console.log('Configurando data mínima...');
    const inputData = document.getElementById('data');
    if (inputData) {
        const hoje = new Date();
        const dataMinima = hoje.toISOString().split('T')[0];
        inputData.min = dataMinima;

        // Definir data máxima (1 ano a partir de hoje)
        const dataMaxima = new Date(hoje);
        dataMaxima.setFullYear(dataMaxima.getFullYear() + 1);
        inputData.max = dataMaxima.toISOString().split('T')[0];

        // Definir data padrão (hoje)
        if (!inputData.value) {
            inputData.value = dataMinima;
        }

        console.log('Data mínima configurada:', dataMinima);
        console.log('Data máxima configurada:', inputData.max);
    } else {
        console.error('Campo de data não encontrado!');
    }
}

// Função para exibir informações sobre o navegador
function exibirInfoNavegador() {
    console.log('Informações do navegador:');
    console.log('User Agent:', navigator.userAgent);
    console.log('Plataforma:', navigator.platform);
    console.log('Linguagem:', navigator.language);

    // Verificar suporte a recursos importantes
    console.log('Suporte a Fetch API:', typeof fetch !== 'undefined');
    console.log('Suporte a Módulos ES6:', 'noModule' in HTMLScriptElement.prototype);
    console.log('Suporte a Promise:', typeof Promise !== 'undefined');
}

// Função principal de inicialização
function inicializar() {
    console.log('Inicializando aplicação...');

    try {
        exibirInfoNavegador();
        definirDataMinima();
        verificarDisponibilidadeAPI();

        // Registrar que a inicialização foi concluída
        console.log('Inicialização concluída com sucesso!');

        // Emitir evento de inicialização concluída
        const evento = new CustomEvent('appInitialized', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(evento);
    } catch (error) {
        console.error('Erro durante a inicialização da aplicação:', error);
    }
}

// Executar a inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}