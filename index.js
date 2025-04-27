// Adicionar um console.log no início do arquivo
console.log('index.js - INÍCIO DO CARREGAMENTO');

import { criarCartaoVoo } from './src/utils/flightDisplay.js';

// Verificar se as importações foram bem-sucedidas
console.log('Importações carregadas:', {
    criarCartaoVoo: typeof criarCartaoVoo === 'function',
    searchFlights: typeof window.searchFlights === 'function',
});

// Verificar se a função global está disponível
let searchFlights;

// Adicione após a declaração das variáveis globais
let isBuscaRapida = false;

// Função para inicializar a aplicação
async function initApp() {
    console.log('Iniciando aplicação...');

    // Adicionar estilos CSS para os avisos de busca rápida
    const estilosBuscaRapida = document.createElement('style');
    estilosBuscaRapida.textContent = `
        /* Estilos para o aviso de busca rápida */
        .busca-rapida-info {
            background-color: #e8f5e9;
            border-left: 4px solid #4CAF50;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
        }
        
        .busca-rapida-mensagem {
            font-style: italic;
            color: #666;
            padding: 5px 10px;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(estilosBuscaRapida);

    // Verificar se a função searchFlights já está disponível
    if (typeof window.searchFlights === 'function') {
        searchFlights = window.searchFlights;
        console.log('Função searchFlights já está disponível');
    } else {
        // Se não estiver disponível, aguardar o evento setupComplete
        console.log('Aguardando carregamento da função searchFlights...');

        await new Promise(resolve => {
            // Ouvir o evento customizado uma única vez
            document.addEventListener('setupComplete', () => {
                searchFlights = window.searchFlights;
                console.log('Função searchFlights carregada a partir do evento');
                resolve();
            }, { once: true });

            // Timeout para não ficar esperando indefinidamente
            setTimeout(() => {
                console.warn('Timeout ao aguardar carregamento da função searchFlights');
                searchFlights = async() => {
                    console.error('Função searchFlights não disponível');
                    return { error: 'Serviço de busca não disponível', results: [] };
                };
                resolve();
            }, 10000);
        });
    }

    console.log('Inicialização completa, searchFlights disponível:', typeof searchFlights === 'function');

    // Adicionar o botão de busca rápida
    const searchForm = document.querySelector('.search-form');

    if (searchForm) {
        const buscaRapidaContainer = document.createElement('div');
        buscaRapidaContainer.className = 'busca-rapida-container';
        buscaRapidaContainer.innerHTML = `
            <label class="toggle-container">
                <input type="checkbox" id="busca-rapida-toggle">
                <span class="toggle-slider"></span>
                <span class="toggle-label">Buscar voos mais rápidos</span>
                <span class="toggle-tooltip" title="Prioriza voos diretos e conexões curtas">ℹ️</span>
            </label>
        `;

        // Adicionar antes do botão de busca
        const buscarBtn = document.getElementById('buscar');
        if (buscarBtn) {
            buscarBtn.parentNode.insertBefore(buscaRapidaContainer, buscarBtn);
        } else {
            searchForm.appendChild(buscaRapidaContainer);
        }

        // Adicionar estilo CSS para o novo botão
        const style = document.createElement('style');
        style.textContent = `
            .busca-rapida-container {
                margin: 10px 0;
                display: flex;
                align-items: center;
            }
            
            .busca-rapida-container .toggle-tooltip {
                margin-left: 5px;
                cursor: help;
                opacity: 0.7;
            }
            
            .voo-rapido-tag {
                background-color: #4CAF50;
                color: white;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                margin-right: 10px;
                display: inline-flex;
                align-items: center;
            }
            
            .voo-rapido-tag .icon {
                margin-right: 4px;
            }
            
            .tempo-economizado {
                background-color: #2196F3;
                color: white;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                margin-left: 5px;
                display: inline-flex;
                align-items: center;
            }
            
            /* Estilos para o aviso de busca rápida */
            .busca-rapida-info {
                background-color: #e8f5e9;
                border-left: 4px solid #4CAF50;
                padding: 10px;
                margin-top: 10px;
                border-radius: 4px;
            }
            
            .busca-rapida-mensagem {
                font-style: italic;
                color: #666;
                padding: 5px 10px;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);

        // Adicionar evento de mudança para o botão
        const buscaRapidaToggle = document.getElementById('busca-rapida-toggle');
        if (buscaRapidaToggle) {
            buscaRapidaToggle.addEventListener('change', function() {
                isBuscaRapida = this.checked;
                console.log('Busca rápida:', isBuscaRapida);
            });
        }
    }
}

// Lista de aeroportos disponíveis
const aeroportos = [
    // São Paulo
    { codigo: 'GRU', nome: 'São Paulo - Guarulhos', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'CGH', nome: 'São Paulo - Congonhas', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'VCP', nome: 'Campinas - Viracopos', cidade: 'Campinas', estado: 'SP' },
    { codigo: 'SJP', nome: 'São José do Rio Preto', cidade: 'São José do Rio Preto', estado: 'SP' },
    { codigo: 'RAO', nome: 'Ribeirão Preto', cidade: 'Ribeirão Preto', estado: 'SP' },
    { codigo: 'PPB', nome: 'Presidente Prudente', cidade: 'Presidente Prudente', estado: 'SP' },
    { codigo: 'BAU', nome: 'Bauru - Arealva', cidade: 'Bauru', estado: 'SP' },
    { codigo: 'ARU', nome: 'Araçatuba', cidade: 'Araçatuba', estado: 'SP' },
    { codigo: 'QPS', nome: 'São Carlos', cidade: 'São Carlos', estado: 'SP' },
    { codigo: 'SOD', nome: 'Sorocaba', cidade: 'Sorocaba', estado: 'SP' },

    // Rio de Janeiro
    { codigo: 'GIG', nome: 'Rio de Janeiro - Galeão', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'SDU', nome: 'Rio de Janeiro - Santos Dumont', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'CFB', nome: 'Cabo Frio', cidade: 'Cabo Frio', estado: 'RJ' },
    { codigo: 'MEA', nome: 'Macaé', cidade: 'Macaé', estado: 'RJ' },

    // Nordeste
    { codigo: 'REC', nome: 'Recife - Guararapes', cidade: 'Recife', estado: 'PE' },
    { codigo: 'SSA', nome: 'Salvador - Luis E. Magalhães', cidade: 'Salvador', estado: 'BA' },
    { codigo: 'FOR', nome: 'Fortaleza - Pinto Martins', cidade: 'Fortaleza', estado: 'CE' },
    { codigo: 'NAT', nome: 'Natal - Augusto Severo', cidade: 'Natal', estado: 'RN' },
    { codigo: 'MCZ', nome: 'Maceió - Zumbi dos Palmares', cidade: 'Maceió', estado: 'AL' },
    { codigo: 'JPA', nome: 'João Pessoa - Castro Pinto', cidade: 'João Pessoa', estado: 'PB' },
    { codigo: 'AJU', nome: 'Aracaju - Santa Maria', cidade: 'Aracaju', estado: 'SE' },
    { codigo: 'SLZ', nome: 'São Luís - Marechal Cunha Machado', cidade: 'São Luís', estado: 'MA' },
    { codigo: 'THE', nome: 'Teresina - Senador Petrônio Portella', cidade: 'Teresina', estado: 'PI' },
    { codigo: 'IMP', nome: 'Imperatriz', cidade: 'Imperatriz', estado: 'MA' },
    { codigo: 'JDO', nome: 'Juazeiro do Norte', cidade: 'Juazeiro do Norte', estado: 'CE' },
    { codigo: 'IOS', nome: 'Ilhéus', cidade: 'Ilhéus', estado: 'BA' },
    { codigo: 'BPS', nome: 'Porto Seguro', cidade: 'Porto Seguro', estado: 'BA' },
    { codigo: 'FEN', nome: 'Fernando de Noronha', cidade: 'Fernando de Noronha', estado: 'PE' },
    { codigo: 'PNZ', nome: 'Petrolina', cidade: 'Petrolina', estado: 'PE' },
    { codigo: 'CPV', nome: 'Campina Grande', cidade: 'Campina Grande', estado: 'PB' },
    { codigo: 'BRA', nome: 'Barreiras', cidade: 'Barreiras', estado: 'BA' },
    { codigo: 'VDC', nome: 'Vitória da Conquista', cidade: 'Vitória da Conquista', estado: 'BA' },

    // Centro-Oeste
    { codigo: 'BSB', nome: 'Brasília Internacional', cidade: 'Brasília', estado: 'DF' },
    { codigo: 'CGR', nome: 'Campo Grande', cidade: 'Campo Grande', estado: 'MS' },
    { codigo: 'CGB', nome: 'Cuiabá - Marechal Rondon', cidade: 'Cuiabá', estado: 'MT' },
    { codigo: 'GYN', nome: 'Goiânia - Santa Genoveva', cidade: 'Goiânia', estado: 'GO' },
    { codigo: 'CQA', nome: 'Canarana', cidade: 'Canarana', estado: 'MT' },
    { codigo: 'ROO', nome: 'Rondonópolis', cidade: 'Rondonópolis', estado: 'MT' },
    { codigo: 'OPS', nome: 'Sinop', cidade: 'Sinop', estado: 'MT' },
    { codigo: 'PPY', nome: 'Poconé', cidade: 'Poconé', estado: 'MT' },
    { codigo: 'BPG', nome: 'Barra do Garças', cidade: 'Barra do Garças', estado: 'MT' },

    // Sul
    { codigo: 'POA', nome: 'Porto Alegre - Salgado Filho', cidade: 'Porto Alegre', estado: 'RS' },
    { codigo: 'FLN', nome: 'Florianópolis - Hercílio Luz', cidade: 'Florianópolis', estado: 'SC' },
    { codigo: 'CWB', nome: 'Curitiba - Afonso Pena', cidade: 'Curitiba', estado: 'PR' },
    { codigo: 'IGU', nome: 'Foz do Iguaçu', cidade: 'Foz do Iguaçu', estado: 'PR' },
    { codigo: 'LDB', nome: 'Londrina', cidade: 'Londrina', estado: 'PR' },
    { codigo: 'JOI', nome: 'Joinville', cidade: 'Joinville', estado: 'SC' },
    { codigo: 'XAP', nome: 'Chapecó', cidade: 'Chapecó', estado: 'SC' },
    { codigo: 'CXJ', nome: 'Caxias do Sul', cidade: 'Caxias do Sul', estado: 'RS' },
    { codigo: 'PET', nome: 'Pelotas', cidade: 'Pelotas', estado: 'RS' },
    { codigo: 'BGX', nome: 'Bagé', cidade: 'Bagé', estado: 'RS' },
    { codigo: 'URG', nome: 'Uruguaiana', cidade: 'Uruguaiana', estado: 'RS' },

    // Norte
    { codigo: 'BEL', nome: 'Belém - Val de Cans', cidade: 'Belém', estado: 'PA' },
    { codigo: 'MAO', nome: 'Manaus - Eduardo Gomes', cidade: 'Manaus', estado: 'AM' },
    { codigo: 'PMW', nome: 'Palmas', cidade: 'Palmas', estado: 'TO' },
    { codigo: 'PVH', nome: 'Porto Velho', cidade: 'Porto Velho', estado: 'RO' },
    { codigo: 'RBR', nome: 'Rio Branco', cidade: 'Rio Branco', estado: 'AC' },
    { codigo: 'BVB', nome: 'Boa Vista', cidade: 'Boa Vista', estado: 'RR' },
    { codigo: 'MCP', nome: 'Macapá', cidade: 'Macapá', estado: 'AP' },
    { codigo: 'STM', nome: 'Santarém', cidade: 'Santarém', estado: 'PA' },
    { codigo: 'CZS', nome: 'Cruzeiro do Sul', cidade: 'Cruzeiro do Sul', estado: 'AC' },
    { codigo: 'ATM', nome: 'Altamira', cidade: 'Altamira', estado: 'PA' },
    { codigo: 'TBT', nome: 'Tabatinga', cidade: 'Tabatinga', estado: 'AM' },
    { codigo: 'PIN', nome: 'Parintins', cidade: 'Parintins', estado: 'AM' },
    { codigo: 'TFF', nome: 'Tefé', cidade: 'Tefé', estado: 'AM' },

    // Sudeste (além de SP e RJ)
    { codigo: 'CNF', nome: 'Belo Horizonte - Confins', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'PLU', nome: 'Belo Horizonte - Pampulha', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'VIX', nome: 'Vitória - Eurico Salles', cidade: 'Vitória', estado: 'ES' },
    { codigo: 'UDI', nome: 'Uberlândia', cidade: 'Uberlândia', estado: 'MG' },
    { codigo: 'MOC', nome: 'Montes Claros', cidade: 'Montes Claros', estado: 'MG' },
    { codigo: 'IPN', nome: 'Ipatinga', cidade: 'Ipatinga', estado: 'MG' },
    { codigo: 'JDF', nome: 'Juiz de Fora', cidade: 'Juiz de Fora', estado: 'MG' },
    { codigo: 'VAG', nome: 'Varginha', cidade: 'Varginha', estado: 'MG' },
    { codigo: 'POO', nome: 'Poços de Caldas', cidade: 'Poços de Caldas', estado: 'MG' },
    { codigo: 'DIQ', nome: 'Divinópolis', cidade: 'Divinópolis', estado: 'MG' },
    { codigo: 'GVR', nome: 'Governador Valadares', cidade: 'Governador Valadares', estado: 'MG' }
];

// Função para criar a lista de sugestões
function criarListaSugestoes(input, lista) {
    const container = document.createElement('div');
    container.className = 'sugestoes-container';
    container.style.display = 'none';
    input.parentNode.appendChild(container);
    return container;
}

// Função para mostrar sugestões
function mostrarSugestoes(input, container, termo) {
    if (!termo || termo.length < 2) {
        container.style.display = 'none';
        return;
    }

    // Primeiro busca localmente nas listas definidas
    const sugestoes = aeroportos.filter(aeroporto =>
        aeroporto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        aeroporto.cidade.toLowerCase().includes(termo.toLowerCase()) ||
        aeroporto.codigo.toLowerCase().includes(termo.toLowerCase()) ||
        aeroporto.estado.toLowerCase().includes(termo.toLowerCase())
    );

    container.innerHTML = '';

    // Adiciona um indicador para informar que o usuário pode digitar qualquer código IATA
    const infoItem = document.createElement('div');
    infoItem.className = 'sugestao-info';
    infoItem.textContent = 'Você pode digitar qualquer código de aeroporto brasileiro (3 letras)';
    container.appendChild(infoItem);

    if (sugestoes.length > 0) {
        // Adicionar um título para os aeroportos sugeridos
        const tituloResultados = document.createElement('div');
        tituloResultados.className = 'sugestao-titulo';
        tituloResultados.textContent = 'Aeroportos sugeridos:';
        container.appendChild(tituloResultados);

        // Mostrar os resultados em ordem alfabética por cidade
        sugestoes
            .sort((a, b) => a.cidade.localeCompare(b.cidade))
            .forEach(aeroporto => {
                const div = document.createElement('div');
                div.className = 'sugestao-item';
                div.textContent = `${aeroporto.cidade} - ${aeroporto.codigo} (${aeroporto.nome})`;
                div.dataset.codigo = aeroporto.codigo;
                div.dataset.nome = aeroporto.nome;
                div.dataset.cidade = aeroporto.cidade;

                div.addEventListener('click', () => {
                    input.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;
                    input.dataset.codigo = aeroporto.codigo;
                    container.style.display = 'none';
                });

                container.appendChild(div);
            });
    } else {
        // Se não encontrou resultados locais, adicionar uma mensagem informativa
        const semResultados = document.createElement('div');
        semResultados.className = 'sugestao-sem-resultados';
        semResultados.textContent = 'Nenhum aeroporto encontrado na nossa lista. Você pode inserir diretamente o código IATA de 3 letras.';
        container.appendChild(semResultados);
    }

    container.style.display = 'block';
}

// Quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', async() => {
    // Inicializar a aplicação primeiro
    await initApp();

    // Resto do código existente
    // Validação da lista de aeroportos
    console.log(`Lista de aeroportos carregada com ${aeroportos.length} aeroportos`);

    // Verificar se há códigos IATA duplicados
    const codigosIATA = aeroportos.map(a => a.codigo);
    const duplicados = codigosIATA.filter((codigo, index) =>
        codigosIATA.indexOf(codigo) !== index);

    if (duplicados.length > 0) {
        console.warn('Atenção: Existem códigos IATA duplicados na lista:', duplicados);
    }

    // Verificar se todos os códigos IATA têm 3 letras maiúsculas
    const codigosInvalidos = aeroportos.filter(a => !/^[A-Z]{3}$/.test(a.codigo));

    if (codigosInvalidos.length > 0) {
        console.error('Erro: Existem códigos IATA inválidos na lista:',
            codigosInvalidos.map(a => `${a.codigo}: ${a.nome}`));
    }

    const inputOrigem = document.getElementById('origem');
    const inputDestino = document.getElementById('destino');
    const inputData = document.getElementById('data');
    const btnBuscar = document.getElementById('buscar');
    const sugestoesOrigem = document.getElementById('sugestoes-origem');
    const sugestoesDestino = document.getElementById('sugestoes-destino');
    const resultadosDiv = document.getElementById('resultados');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    resultadosDiv.parentNode.insertBefore(errorDiv, resultadosDiv);

    // Define a data mínima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    inputData.min = hoje;

    // Define a data máxima como hoje + 1 ano
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    inputData.max = maxDate.toISOString().split('T')[0];

    console.log(`Limitando datas de ${inputData.min} até ${inputData.max}`);

    // Funções para persistência de dados
    function salvarDadosBusca() {
        const dadosBusca = {
            origem: inputOrigem.value,
            origemCodigo: inputOrigem.dataset.codigo || '',
            destino: inputDestino.value,
            destinoCodigo: inputDestino.dataset.codigo || '',
            data: inputData.value
        };
        localStorage.setItem('vooBusca', JSON.stringify(dadosBusca));
        console.log('Dados de busca salvos:', dadosBusca);
    }

    // Função para salvar os resultados de voos em localStorage
    function salvarResultadosVoos(voos) {
        if (!voos || voos.length === 0) return;

        try {
            localStorage.setItem('vooResultados', JSON.stringify(voos));
            localStorage.setItem('vooResultadosTimestamp', Date.now().toString());
            console.log('Resultados de voos salvos:', voos.length);
        } catch (error) {
            console.error('Erro ao salvar resultados de voos:', error);
            // Se exceder o tamanho do localStorage, tenta salvar uma versão reduzida
            try {
                // Versão simplificada dos voos (menos campos)
                const voosSimplificados = voos.map(voo => ({
                    id: voo.id,
                    companhia: voo.companhia,
                    origem: voo.origem,
                    destino: voo.destino,
                    partida: voo.partida,
                    chegada: voo.chegada,
                    preco: voo.preco,
                    classificacaoPreco: voo.classificacaoPreco
                }));
                localStorage.setItem('vooResultados', JSON.stringify(voosSimplificados));
                localStorage.setItem('vooResultadosTimestamp', Date.now().toString());
                console.log('Versão simplificada dos resultados salva');
            } catch (e) {
                console.error('Não foi possível salvar nem uma versão simplificada:', e);
            }
        }
    }

    function carregarDadosBusca() {
        const dadosSalvos = localStorage.getItem('vooBusca');
        if (dadosSalvos) {
            try {
                const dados = JSON.parse(dadosSalvos);
                console.log('Dados de busca carregados:', dados);

                if (dados.origem) inputOrigem.value = dados.origem;
                if (dados.origemCodigo) inputOrigem.dataset.codigo = dados.origemCodigo;

                if (dados.destino) inputDestino.value = dados.destino;
                if (dados.destinoCodigo) inputDestino.dataset.codigo = dados.destinoCodigo;

                if (dados.data) {
                    // Garante que a data não seja anterior à data atual
                    if (dados.data >= hoje) {
                        inputData.value = dados.data;
                    } else {
                        inputData.value = hoje;
                    }
                } else {
                    inputData.value = hoje;
                }
            } catch (e) {
                console.error('Erro ao carregar dados salvos:', e);
                inputData.value = hoje; // Fallback para hoje
            }
        } else {
            inputData.value = hoje; // Caso não haja dados salvos
        }
    }

    // Função para carregar resultados de voos salvos
    function carregarResultadosVoos() {
        const resultadosSalvos = localStorage.getItem('vooResultados');
        const timestamp = localStorage.getItem('vooResultadosTimestamp');

        if (resultadosSalvos && timestamp) {
            try {
                // Verificar se os resultados não estão muito antigos (24 horas)
                const agora = Date.now();
                const dataResultados = parseInt(timestamp, 10);
                const diferencaHoras = (agora - dataResultados) / (1000 * 60 * 60);

                if (diferencaHoras > 24) {
                    console.log('Resultados salvos são muito antigos (> 24h). Ignorando.');
                    return null;
                }

                const voos = JSON.parse(resultadosSalvos);
                console.log('Resultados de voos carregados:', voos.length);
                return voos;
            } catch (error) {
                console.error('Erro ao carregar resultados salvos:', error);
                return null;
            }
        }
        return null;
    }

    // Exibir resultados salvos ao carregar a página
    function exibirResultadosSalvos() {
        const resultadosSalvos = carregarResultadosVoos();
        if (resultadosSalvos && resultadosSalvos.length > 0) {
            console.log('Exibindo resultados salvos');

            // Limpar resultados atuais
            resultadosDiv.innerHTML = '';

            // Aviso de que são resultados salvos
            const avisoDiv = document.createElement('div');
            avisoDiv.className = 'aviso-resultados-salvos';
            avisoDiv.textContent = 'Mostrando resultados da última pesquisa. Clique em "Buscar" para atualizar.';
            resultadosDiv.appendChild(avisoDiv);

            // Criar e exibir o comparativo de preços
            const comparativoPrecos = criarComparativoPrecos(resultadosSalvos);
            if (comparativoPrecos) {
                resultadosDiv.appendChild(comparativoPrecos);
            }

            // Exibir os cartões dos voos
            resultadosSalvos.forEach(voo => {
                try {
                    // Verifica se temos todos os dados necessários
                    if (!voo.horarioPartida && voo.partida) {
                        // Se o voo salvo não tem os dados formatados, preencher
                        const partida = new Date(voo.partida);
                        const chegada = new Date(voo.chegada);

                        voo.horarioPartida = partida.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        voo.horarioChegada = chegada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                        // Calcular duração se não existir
                        if (!voo.duracao) {
                            const duracaoMinutos = Math.floor((chegada - partida) / 60000);
                            const horas = Math.floor(duracaoMinutos / 60);
                            const minutos = duracaoMinutos % 60;
                            voo.duracao = `${horas}h ${minutos}m`;
                        }
                    }

                    if (!voo.horarioPartida || !voo.horarioChegada || !voo.duracao || !voo.preco) {
                        console.error('Dados incompletos para o voo salvo:', voo);
                        return; // Pula este voo
                    }

                    const card = criarCartaoVoo(voo);
                    resultadosDiv.appendChild(card);
                } catch (error) {
                    console.error('Erro ao criar cartão de voo salvo:', error, voo);
                }
            });
        }
    }

    // Carrega os dados salvos ao iniciar a página
    carregarDadosBusca();

    // Exibe resultados salvos, se existirem
    exibirResultadosSalvos();

    function encontrarAeroporto(texto) {
        if (!texto || typeof texto !== 'string') return null;

        const termoBusca = texto.toLowerCase().trim();

        // Verificar se o texto está no formato esperado "Cidade - CÓDIGO" ou contém o código IATA
        const matchCodigo = termoBusca.match(/\(([A-Za-z]{3})\)$/) || termoBusca.match(/\s-\s([A-Za-z]{3})$/);
        if (matchCodigo) {
            const codigo = matchCodigo[1].toUpperCase();
            return aeroportos.find(aeroporto => aeroporto.codigo === codigo);
        }

        // Para outros casos, tenta encontrar uma correspondência exata primeiro
        const aeroportoExato = aeroportos.find(
            aeroporto => aeroporto.nome.toLowerCase() === termoBusca ||
            aeroporto.cidade.toLowerCase() === termoBusca ||
            aeroporto.codigo.toLowerCase() === termoBusca
        );

        if (aeroportoExato) return aeroportoExato;

        // Se não encontrou correspondência exata, busca parcial apenas se o texto for mais longo
        if (termoBusca.length >= 3) {
            return aeroportos.find(
                aeroporto => aeroporto.nome.toLowerCase().includes(termoBusca) ||
                aeroporto.cidade.toLowerCase().includes(termoBusca)
            );
        }

        return null;
    }

    inputOrigem.addEventListener('input', (e) => {
        // Limpa o código armazenado quando o usuário digita
        delete inputOrigem.dataset.codigo;
        mostrarSugestoes(inputOrigem, sugestoesOrigem, e.target.value);
    });

    inputDestino.addEventListener('input', (e) => {
        // Limpa o código armazenado quando o usuário digita
        delete inputDestino.dataset.codigo;
        mostrarSugestoes(inputDestino, sugestoesDestino, e.target.value);
    });

    // Salvar os dados quando a data for alterada
    inputData.addEventListener('change', () => {
        salvarDadosBusca();
    });

    document.addEventListener('click', (e) => {
        if (!sugestoesOrigem.contains(e.target) && e.target !== inputOrigem) {
            sugestoesOrigem.style.display = 'none';
        }
        if (!sugestoesDestino.contains(e.target) && e.target !== inputDestino) {
            sugestoesDestino.style.display = 'none';
        }
    });

    // Validação direta ao perder o foco
    inputOrigem.addEventListener('blur', () => {
        // Se não tem código no dataset, tenta encontrar
        if (!inputOrigem.dataset.codigo) {
            const aeroporto = encontrarAeroporto(inputOrigem.value);
            if (aeroporto) {
                inputOrigem.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;
                inputOrigem.dataset.codigo = aeroporto.codigo;
            }
        }
    });

    // Validação direta ao perder o foco
    inputDestino.addEventListener('blur', () => {
        // Se não tem código no dataset, tenta encontrar
        if (!inputDestino.dataset.codigo) {
            const aeroporto = encontrarAeroporto(inputDestino.value);
            if (aeroporto) {
                inputDestino.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;
                inputDestino.dataset.codigo = aeroporto.codigo;
            }
        }
    });

    function mostrarErro(mensagem) {
        errorDiv.textContent = mensagem;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    function extrairCodigoIATA(texto) {
        if (!texto) return '';

        // Tentar extrair do formato "Cidade - CÓDIGO"
        const match = texto.match(/\s-\s([A-Z]{3})$/);
        if (match) return match[1];

        // Se não encontrou no formato esperado, tenta no dataset
        return '';
    }

    // Verificar se a função searchFlights está disponível
    if (typeof searchFlights !== 'function') {
        console.error('Função searchFlights não está disponível');
        mostrarErro('O serviço de busca não está disponível no momento. Por favor, tente novamente mais tarde.');
    }

    async function buscarVoos() {
        // Limpar erros anteriores
        errorDiv.style.display = 'none';

        console.log('Função buscarVoos iniciada');

        // Obter o código IATA de origem (do dataset ou extraindo do texto)
        const origemCodigo = inputOrigem.dataset.codigo || extrairCodigoIATA(inputOrigem.value);
        console.log('Código de origem:', origemCodigo, 'Valor do input:', inputOrigem.value, 'Dataset:', inputOrigem.dataset.codigo);

        if (!origemCodigo) {
            mostrarErro('Por favor, selecione um aeroporto de origem válido.');
            return;
        }

        // Obter o código IATA de destino (do dataset ou extraindo do texto)
        const destinoCodigo = inputDestino.dataset.codigo || extrairCodigoIATA(inputDestino.value);
        console.log('Código de destino:', destinoCodigo, 'Valor do input:', inputDestino.value, 'Dataset:', inputDestino.dataset.codigo);

        if (!destinoCodigo) {
            mostrarErro('Por favor, selecione um aeroporto de destino válido.');
            return;
        }

        // Validar data
        const data = inputData.value;
        console.log('Data selecionada:', data);

        if (!data) {
            mostrarErro('Por favor, selecione uma data para a viagem.');
            return;
        }

        console.log('Busca rápida ativa:', isBuscaRapida);

        // Validar se origem e destino são diferentes
        if (origemCodigo === destinoCodigo) {
            mostrarErro('Origem e destino não podem ser iguais');
            return;
        }

        loadingDiv.style.display = 'block';
        console.log('Iniciando chamada à API com códigos:', origemCodigo, destinoCodigo);
        console.log('Função searchFlights disponível:', typeof searchFlights === 'function');
        console.log('Função searchFastFlights disponível:', typeof window.searchFastFlights === 'function');

        try {
            console.log('Chamando busca de voos com parâmetros:', {
                origin: origemCodigo,
                destination: destinoCodigo,
                date: data,
                buscaRapida: isBuscaRapida
            });

            let response;

            // Verificar se estamos usando busca rápida ou normal
            if (isBuscaRapida) {
                console.log('Tentando usar busca rápida...');
                // Importar a função searchFastFlights se não estiver disponível globalmente
                const searchFastFlights =
                    typeof window.searchFastFlights === 'function' ?
                    window.searchFastFlights :
                    (await
                        import ('./src/services/flightService.js')).searchFastFlights;

                console.log('Função searchFastFlights obtida:', typeof searchFastFlights === 'function');

                response = await searchFastFlights({
                    origin: origemCodigo,
                    destination: destinoCodigo,
                    date: data
                }, {
                    maxDurationHours: 12, // 12 horas máximo
                    maxConnectionMinutes: 120, // 2 horas máximo de conexão
                    preferNonStop: true // Priorizar voos diretos
                });
            } else {
                console.log('Usando busca normal...');
                if (typeof searchFlights !== 'function') {
                    console.error('ERRO CRÍTICO: searchFlights não é uma função!');
                    mostrarErro('Serviço de busca indisponível. Verifique o console para mais detalhes.');
                    loadingDiv.style.display = 'none';
                    return;
                }

                response = await searchFlights({
                    origin: origemCodigo,
                    destination: destinoCodigo,
                    date: data
                });
            }

            console.log('Resposta completa da API:', response);

            loadingDiv.style.display = 'none';

            // Limpar os resultados anteriores
            resultadosDiv.innerHTML = '';

            // Se houver uma mensagem sobre a data, exibir aviso
            if (response.dateMessage) {
                const avisoDataDiv = document.createElement('div');
                avisoDataDiv.className = 'aviso-data';
                avisoDataDiv.innerHTML = `
                                    <div class="aviso-data-conteudo">
                                        <span class="icone-info">ℹ️</span>
                                        <span>${response.dateMessage}</span>
                                    </div>
                                `;
                resultadosDiv.appendChild(avisoDataDiv);

                // Atualizar o campo de data visível para o usuário
                document.getElementById('data').value = data;
            }

            // Verificar onde estão os dados dos voos na resposta
            console.log('Estrutura da resposta:', {
                hasResults: Boolean(response.results),
                resultsLength: response.results ? response.results.length : 0,
                hasVoos: Boolean(response.voos),
                voosLength: response.voos ? response.voos.length : 0,
                hasData: Boolean(response.data),
                dataLength: response.data ? response.data.length : 0
            });

            // Tentar acessar os resultados conforme a estrutura de retorno
            const voos = response.results || response.voos || response.data || [];
            console.log('Voos encontrados:', voos.length, voos.slice(0, 2));

            if (!voos || voos.length === 0) {
                const noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results';
                noResultsDiv.textContent = 'Nenhum voo encontrado para esta rota e data.';
                resultadosDiv.appendChild(noResultsDiv);
                return;
            }

            // Adicionar aviso sobre preços
            const avisoPrecoDiv = document.createElement('div');
            avisoPrecoDiv.className = 'aviso-preco';

            let avisoHTML = `
                                <p>Ao reservar, você será direcionado para o site oficial da companhia aérea para completar sua compra.</p>
                            `;

            // Adicionar informação se está usando busca rápida
            if (isBuscaRapida) {
                avisoHTML += `
                                <p class="busca-rapida-info"><strong>Busca rápida ativada:</strong> Estamos priorizando voos diretos e com conexões mais curtas para economizar seu tempo.</p>
                                `;

                // Se houver informação específica na resposta
                if (response.meta && response.meta.fastFlightMessage) {
                    avisoHTML += `
                                    <p class="busca-rapida-mensagem">${response.meta.fastFlightMessage}</p>
                                    `;
                }
            }

            avisoPrecoDiv.innerHTML = avisoHTML;
            resultadosDiv.appendChild(avisoPrecoDiv);

            // Criar e exibir o comparativo de preços
            const comparativoPrecos = criarComparativoPrecos(voos);
            if (comparativoPrecos) {
                resultadosDiv.appendChild(comparativoPrecos);
            }

            voos.forEach(voo => {
                try {
                    // Normalizar voo para garantir compatibilidade
                    const vooNormalizado = {
                        ...voo,
                        // Garantir campos essenciais
                        partida: voo.partida || (voo.departureDate && voo.departureTime ?
                            `${voo.departureDate}T${voo.departureTime}` :
                            new Date().toISOString()),
                        chegada: voo.chegada || (voo.departureDate && voo.arrivalTime ?
                            `${voo.departureDate}T${voo.arrivalTime}` :
                            new Date(Date.now() + 3600000).toISOString()),
                        horarioPartida: voo.horarioPartida || voo.departureTime || '',
                        horarioChegada: voo.horarioChegada || voo.arrivalTime || '',
                        duracao: voo.duracao || voo.duration || '',
                        companhia: voo.companhia || voo.airline || '',
                        preco: voo.preco || parseFloat(voo.price) || 0,
                        origem: voo.origem || voo.origin || origemCodigo,
                        destino: voo.destino || voo.destination || destinoCodigo
                    };

                    console.log('Voo normalizado para interface:', vooNormalizado);

                    // Verifica se temos todos os dados necessários
                    if (!vooNormalizado.horarioPartida || !vooNormalizado.horarioChegada || !vooNormalizado.duracao || !vooNormalizado.preco) {
                        console.error('Dados incompletos para o voo:', vooNormalizado);
                        return; // Pula este voo
                    }

                    const card = criarCartaoVoo(vooNormalizado);
                    resultadosDiv.appendChild(card);
                } catch (error) {
                    console.error('Erro ao criar cartão de voo:', error, voo);
                }
            });

            // Salvar resultados para persistência
            salvarResultadosVoos(voos);

        } catch (erro) {
            console.error('Erro detalhado:', erro);
            loadingDiv.style.display = 'none';

            // Mensagem de erro mais amigável e detalhada
            let mensagemErro = `Erro ao buscar voos: ${erro.message}`;

            // Se o erro for relacionado à data
            if (erro.message.includes('Data') || erro.message.toLowerCase().includes('date')) {
                mensagemErro = 'Não foi possível completar a busca. Por favor, verifique se a data está correta ou tente novamente mais tarde.';
            }

            // Se for erro de API ou conexão
            if (erro.message.includes('API') || erro.message.includes('fetch') || erro.message.includes('network')) {
                mensagemErro = 'Erro de conexão com o servidor. Por favor, verifique sua conexão com a internet e tente novamente.';
            }

            mostrarErro(mensagemErro);
            console.error('Erro na busca:', erro);
        }
    }

    // Função para criar um comparativo de preços entre companhias aéreas
    function criarComparativoPrecos(voos) {
        if (!voos || voos.length < 2) return null;

        // Agrupar voos por companhia aérea e encontrar os mais baratos
        const precosPorCompanhia = {};

        voos.forEach(voo => {
            if (!precosPorCompanhia[voo.companhia] || voo.preco < precosPorCompanhia[voo.companhia].preco) {
                precosPorCompanhia[voo.companhia] = {
                    companhia: voo.companhia,
                    preco: voo.preco
                };
            }
        });

        // Criar array de companhias e ordenar por preço
        const companhias = Object.values(precosPorCompanhia);
        companhias.sort((a, b) => a.preco - b.preco);

        // Limitar a exibição às 3 companhias mais baratas
        const companhiasExibidas = companhias.slice(0, 3);

        // Criar elemento de comparativo
        const comparativoDiv = document.createElement('div');
        comparativoDiv.className = 'comparativo-container';

        const titulo = document.createElement('div');
        titulo.className = 'comparacao-titulo';
        titulo.textContent = 'Comparativo de Preços:';

        const valoresDiv = document.createElement('div');
        valoresDiv.className = 'comparacao-valores';

        companhiasExibidas.forEach((comp, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'comparacao-item';

            const companhiaDiv = document.createElement('div');
            companhiaDiv.className = 'comparacao-companhia';
            companhiaDiv.textContent = comp.companhia;

            const precoDiv = document.createElement('div');
            precoDiv.className = 'valor-preco';
            if (index === 0) precoDiv.classList.add('melhor');
            precoDiv.textContent = `R$ ${comp.preco.toFixed(2)}`;

            itemDiv.appendChild(companhiaDiv);
            itemDiv.appendChild(precoDiv);
            valoresDiv.appendChild(itemDiv);
        });

        comparativoDiv.appendChild(titulo);
        comparativoDiv.appendChild(valoresDiv);

        return comparativoDiv;
    }

    function formatarHorario(data) {
        return new Date(data).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    btnBuscar.addEventListener('click', () => {
        console.log('Botão buscar clicado');
        console.log('Dados de entrada:', {
            origem: inputOrigem.value,
            destino: inputDestino.value,
            data: inputData.value
        });
        salvarDadosBusca();
        buscarVoos();
    });

    // Adicionar evento de tecla para o formulário
    document.getElementById('search-form').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            console.log('Enter pressionado no formulário, iniciando busca');
            btnBuscar.click();
        }
    });

    // Verificar se o botão está funcionando
    console.log('Botão buscar:', btnBuscar ? 'Encontrado' : 'Não encontrado');
    if (btnBuscar) {
        console.log('Botão buscar tem evento de clique:', btnBuscar.onclick ? 'Sim' : 'Não (usando addEventListener)');
    }

    // Modificar a forma como o evento de clique do botão é registrado
    // Adicionar essa função no final do arquivo, fora de qualquer outro bloco
    function registrarEventosBusca() {
        console.log('Registrando eventos de busca...');
        const btnBuscar = document.getElementById('buscar');

        if (btnBuscar) {
            console.log('Botão de busca encontrado, adicionando event listener');
            btnBuscar.addEventListener('click', function() {
                console.log('Botão buscar clicado diretamente');
                if (typeof buscarVoos === 'function') {
                    console.log('Função buscarVoos encontrada, chamando...');
                    buscarVoos();
                } else {
                    console.error('Função buscarVoos não encontrada!');
                    alert('Erro ao buscar voos: função de busca não está disponível.');
                }
            });

            console.log('Event listener adicionado ao botão de busca');
        } else {
            console.error('Botão de busca não encontrado!');
        }

        // Também registrar o evento para o formulário
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(event) {
                event.preventDefault();
                console.log('Formulário enviado, tentando buscar voos');
                if (typeof buscarVoos === 'function') {
                    buscarVoos();
                }
            });
        }
    }

    // Garantir que esta função seja chamada quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado via readyState check, registrando eventos');
            registrarEventosBusca();
        });
    } else {
        console.log('DOM já carregado, registrando eventos imediatamente');
        registrarEventosBusca();
    }

    // Registrar um evento global para o botão de busca
    window.addEventListener('load', function() {
        console.log('Página totalmente carregada, verificando eventos');
        const btnBuscar = document.getElementById('buscar');
        if (btnBuscar && !btnBuscar.hasAttribute('data-event-registered')) {
            console.log('Botão de busca não tem eventos registrados, adicionando...');
            btnBuscar.setAttribute('data-event-registered', 'true');
            btnBuscar.addEventListener('click', function() {
                console.log('Botão buscar clicado via evento global');
                if (typeof buscarVoos === 'function') {
                    buscarVoos();
                } else {
                    console.error('Função buscarVoos não encontrada!');
                    alert('Erro ao buscar voos: função de busca não está disponível.');
                }
            });
        }
    });

    // Adicionar um console.log no final do arquivo
    console.log('index.js - FIM DO CARREGAMENTO');

    // Exportar a função buscarVoos globalmente
    window.buscarVoos = buscarVoos;
});