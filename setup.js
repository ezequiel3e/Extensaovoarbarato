// Configuração inicial da aplicação
console.log('Arquivo setup.js carregado!');

// Registrar um evento para ser executado quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', async() => {
    console.log('Documento carregado, inicializando a aplicação...');

    try {
        // Importar dinamicamente o módulo flightService
        const module = await
        import ('./src/services/flightService.js');

        // Verificar se o módulo foi carregado corretamente
        if (!module || typeof module.searchFlights !== 'function') {
            throw new Error('Módulo flightService não contém a função searchFlights');
        }

        // Disponibilizar a função searchFlights globalmente
        window.searchFlights = module.searchFlights;

        // Disponibilizar a função searchFastFlights (se existir)
        if (typeof module.searchFastFlights === 'function') {
            window.searchFastFlights = module.searchFastFlights;
            console.log('Função searchFastFlights carregada e disponibilizada globalmente');
        } else {
            console.warn('Função searchFastFlights não encontrada no módulo');
        }

        console.log('Função searchFlights carregada e disponibilizada globalmente');

        // Verificar se a função foi corretamente exposta
        if (typeof window.searchFlights !== 'function') {
            throw new Error('Não foi possível expor a função searchFlights globalmente');
        }

        // Disparar um evento personalizado para notificar que a configuração está completa
        const event = new CustomEvent('setupComplete');
        document.dispatchEvent(event);
    } catch (error) {
        console.error('Erro ao carregar o módulo flightService:', error);

        // Criar uma função fallback para não travar a aplicação
        window.searchFlights = async function fallbackSearchFlights(params) {
            console.error('Usando função fallback para searchFlights');
            return {
                error: 'Serviço de busca indisponível no momento. Tente novamente mais tarde.',
                results: []
            };
        };

        // Também criar uma função fallback para searchFastFlights
        window.searchFastFlights = async function fallbackSearchFastFlights(params) {
            console.error('Usando função fallback para searchFastFlights');
            return {
                error: 'Serviço de busca rápida indisponível no momento. Tente novamente mais tarde.',
                results: []
            };
        };

        // Mesmo com erro, disparar o evento para não travar a aplicação
        const event = new CustomEvent('setupComplete');
        document.dispatchEvent(event);

        // Exibir erro para o usuário
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = 'Erro ao carregar a aplicação. Por favor, tente novamente.';
        document.body.prepend(errorDiv);
    }
});

// Garantir que os elementos principais estejam sempre disponíveis
document.addEventListener('DOMContentLoaded', function() {
    console.log('setup.js: Verificando elementos principais...');

    // Verificar se o elemento resultados existe
    if (!document.getElementById('resultados')) {
        console.log('setup.js: Elemento resultados não encontrado, criando...');
        const resultadosDiv = document.createElement('div');
        resultadosDiv.id = 'resultados';
        resultadosDiv.className = 'resultados';

        const main = document.querySelector('main');
        if (main) {
            main.appendChild(resultadosDiv);
            console.log('setup.js: Elemento resultados adicionado ao main');
        } else {
            document.body.appendChild(resultadosDiv);
            console.log('setup.js: Elemento resultados adicionado ao body como fallback');
        }
    }
});