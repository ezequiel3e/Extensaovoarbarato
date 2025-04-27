/**
 * Script para carregar módulos essenciais e garantir
 * que elementos críticos da interface estejam disponíveis
 */

console.log('load-modules.js executado');

// Função para garantir que elementos críticos existam
function garantirElementosEssenciais() {
    console.log('Verificando elementos essenciais da interface...');

    // Garantir que a div de resultados exista
    if (!document.getElementById('resultados')) {
        console.log('Elemento resultados não encontrado, criando elemento...');
        const resultadosDiv = document.createElement('div');
        resultadosDiv.id = 'resultados';
        resultadosDiv.className = 'resultados';

        // Encontrar um local para inserir
        const main = document.querySelector('main');
        if (main) {
            main.appendChild(resultadosDiv);
            console.log('Elemento resultados adicionado ao main');
        } else if (document.body) {
            document.body.appendChild(resultadosDiv);
            console.log('Elemento resultados adicionado ao body');
        } else {
            console.error('Não foi possível criar o elemento resultados - DOM incompleto');
            // Tentar novamente após um timeout
            setTimeout(garantirElementosEssenciais, 200);
            return;
        }
    }

    // Garantir que a div de loading exista
    if (!document.getElementById('loading')) {
        console.log('Elemento loading não encontrado, criando elemento...');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.className = 'loading';
        loadingDiv.style.display = 'none';

        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loadingDiv.appendChild(spinner);

        const text = document.createElement('p');
        text.textContent = 'Buscando os melhores voos para você...';
        loadingDiv.appendChild(text);

        // Inserir antes da div de resultados
        const resultadosDiv = document.getElementById('resultados');
        if (resultadosDiv && resultadosDiv.parentNode) {
            resultadosDiv.parentNode.insertBefore(loadingDiv, resultadosDiv);
            console.log('Elemento loading adicionado antes de resultados');
        } else {
            const main = document.querySelector('main');
            if (main) {
                main.appendChild(loadingDiv);
                console.log('Elemento loading adicionado ao main');
            } else if (document.body) {
                document.body.appendChild(loadingDiv);
                console.log('Elemento loading adicionado ao body');
            }
        }
    }
}

// Verificar se o DOM já está carregado
if (document.readyState === 'loading') {
    console.log('DOM ainda carregando, adicionando evento...');
    document.addEventListener('DOMContentLoaded', garantirElementosEssenciais);
} else {
    console.log('DOM já carregado, executando imediatamente...');
    garantirElementosEssenciais();
}

// Também executar após um curto intervalo para garantir
setTimeout(garantirElementosEssenciais, 200);

// Importar os módulos principais
try {
    import ('./src/services/flightService.js')
    .then(module => {
            console.log('Módulo flightService carregado com sucesso');
            window.searchFlights = module.searchFlights;
            window.searchFastFlights = module.searchFastFlights;
        })
        .catch(error => {
            console.error('Erro ao carregar módulo flightService:', error);
        });

    import ('./src/controllers/buscaController.js')
    .then(module => {
            console.log('Módulo buscaController carregado com sucesso');
            window.inicializarControladorBusca = module.inicializarControladorBusca;
            window.realizarBusca = module.realizarBusca;

            // Inicializar o controlador de busca
            if (typeof module.inicializarControladorBusca === 'function') {
                module.inicializarControladorBusca();
            }
        })
        .catch(error => {
            console.error('Erro ao carregar módulo buscaController:', error);
        });

    import ('./src/utils/flightDisplay.js')
    .then(module => {
            console.log('Módulo flightDisplay carregado com sucesso');
            window.criarCartaoVoo = module.criarCartaoVoo;
            window.exibirErro = module.exibirErro;
            window.getAirlineLogo = module.getAirlineLogo;
        })
        .catch(error => {
            console.error('Erro ao carregar módulo flightDisplay:', error);
        });
} catch (e) {
    console.error('Erro ao importar módulos:', e);
}

console.log('load-modules.js concluído');