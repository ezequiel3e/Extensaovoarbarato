import { searchFlights } from './services/flightService.js';
import { criarCartaoVoo } from './src/utils/flightDisplay.js';

// Lista de aeroportos disponíveis
const aeroportos = [
    // São Paulo
    { codigo: 'GRU', nome: 'São Paulo - Guarulhos', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'CGH', nome: 'São Paulo - Congonhas', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'VCP', nome: 'Campinas - Viracopos', cidade: 'Campinas', estado: 'SP' },
    { codigo: 'SJP', nome: 'São José do Rio Preto', cidade: 'São José do Rio Preto', estado: 'SP' },
    { codigo: 'RAO', nome: 'Ribeirão Preto', cidade: 'Ribeirão Preto', estado: 'SP' },

    // Rio de Janeiro
    { codigo: 'GIG', nome: 'Rio de Janeiro - Galeão', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'SDU', nome: 'Rio de Janeiro - Santos Dumont', cidade: 'Rio de Janeiro', estado: 'RJ' },

    // Nordeste
    { codigo: 'REC', nome: 'Recife - Guararapes', cidade: 'Recife', estado: 'PE' },
    { codigo: 'SSA', nome: 'Salvador - Luis E. Magalhães', cidade: 'Salvador', estado: 'BA' },
    { codigo: 'FOR', nome: 'Fortaleza - Pinto Martins', cidade: 'Fortaleza', estado: 'CE' },
    { codigo: 'NAT', nome: 'Natal - Augusto Severo', cidade: 'Natal', estado: 'RN' },
    { codigo: 'MCZ', nome: 'Maceió - Zumbi dos Palmares', cidade: 'Maceió', estado: 'AL' },
    { codigo: 'JPA', nome: 'João Pessoa - Castro Pinto', cidade: 'João Pessoa', estado: 'PB' },
    { codigo: 'AJU', nome: 'Aracaju - Santa Maria', cidade: 'Aracaju', estado: 'SE' },
    { codigo: 'SLZ', nome: 'São Luís', cidade: 'São Luís', estado: 'MA' },
    { codigo: 'THE', nome: 'Teresina - Senador Petrônio Portella', cidade: 'Teresina', estado: 'PI' },

    // Centro-Oeste
    { codigo: 'BSB', nome: 'Brasília Internacional', cidade: 'Brasília', estado: 'DF' },
    { codigo: 'CGR', nome: 'Campo Grande', cidade: 'Campo Grande', estado: 'MS' },
    { codigo: 'CGB', nome: 'Cuiabá - Marechal Rondon', cidade: 'Cuiabá', estado: 'MT' },
    { codigo: 'GYN', nome: 'Goiânia - Santa Genoveva', cidade: 'Goiânia', estado: 'GO' },

    // Sul
    { codigo: 'POA', nome: 'Porto Alegre - Salgado Filho', cidade: 'Porto Alegre', estado: 'RS' },
    { codigo: 'FLN', nome: 'Florianópolis - Hercílio Luz', cidade: 'Florianópolis', estado: 'SC' },
    { codigo: 'CWB', nome: 'Curitiba - Afonso Pena', cidade: 'Curitiba', estado: 'PR' },
    { codigo: 'IGU', nome: 'Foz do Iguaçu', cidade: 'Foz do Iguaçu', estado: 'PR' },
    { codigo: 'LDB', nome: 'Londrina', cidade: 'Londrina', estado: 'PR' },

    // Norte
    { codigo: 'BEL', nome: 'Belém - Val de Cans', cidade: 'Belém', estado: 'PA' },
    { codigo: 'MAO', nome: 'Manaus - Eduardo Gomes', cidade: 'Manaus', estado: 'AM' },
    { codigo: 'PMW', nome: 'Palmas', cidade: 'Palmas', estado: 'TO' },
    { codigo: 'PVH', nome: 'Porto Velho', cidade: 'Porto Velho', estado: 'RO' },
    { codigo: 'RBR', nome: 'Rio Branco', cidade: 'Rio Branco', estado: 'AC' },
    { codigo: 'BVB', nome: 'Boa Vista', cidade: 'Boa Vista', estado: 'RR' },
    { codigo: 'MCP', nome: 'Macapá', cidade: 'Macapá', estado: 'AP' },

    // Sudeste (além de SP e RJ)
    { codigo: 'CNF', nome: 'Belo Horizonte - Confins', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'PLU', nome: 'Belo Horizonte - Pampulha', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'VIX', nome: 'Vitória - Eurico Salles', cidade: 'Vitória', estado: 'ES' },
    { codigo: 'UDI', nome: 'Uberlândia', cidade: 'Uberlândia', estado: 'MG' }
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
    const sugestoes = aeroportos.filter(aeroporto =>
        aeroporto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        aeroporto.cidade.toLowerCase().includes(termo.toLowerCase()) ||
        aeroporto.codigo.toLowerCase().includes(termo.toLowerCase())
    );

    container.innerHTML = '';

    if (sugestoes.length > 0) {
        sugestoes.forEach(aeroporto => {
            const div = document.createElement('div');
            div.className = 'sugestao-item';
            div.textContent = `${aeroporto.nome} (${aeroporto.codigo})`;

            div.addEventListener('click', () => {
                input.value = `${aeroporto.nome} (${aeroporto.codigo})`;
                container.style.display = 'none';
            });

            container.appendChild(div);
        });
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
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

    // Carrega os dados salvos ao iniciar a página
    carregarDadosBusca();

    function encontrarAeroporto(texto) {
        const termoBusca = texto.toLowerCase().trim();
        return aeroportos.find(aeroporto =>
            aeroporto.nome.toLowerCase().includes(termoBusca) ||
            aeroporto.cidade.toLowerCase().includes(termoBusca) ||
            aeroporto.codigo.toLowerCase() === termoBusca
        );
    }

    function mostrarSugestoes(input, container, valor) {
        container.innerHTML = '';
        if (!valor || valor.length < 2) {
            container.style.display = 'none';
            return;
        }

        const termoBusca = valor.toLowerCase().trim();
        const sugestoes = aeroportos.filter(aeroporto =>
            aeroporto.nome.toLowerCase().includes(termoBusca) ||
            aeroporto.cidade.toLowerCase().includes(termoBusca) ||
            aeroporto.codigo.toLowerCase().includes(termoBusca)
        );

        if (sugestoes.length > 0) {
            container.style.display = 'block';

            sugestoes.forEach(sugestao => {
                const div = document.createElement('div');
                div.className = 'sugestao';

                const divPrincipal = document.createElement('div');
                divPrincipal.className = 'sugestao-principal';
                divPrincipal.textContent = `${sugestao.cidade} - ${sugestao.estado}`;

                const divSecundaria = document.createElement('div');
                divSecundaria.className = 'sugestao-secundaria';
                divSecundaria.textContent = `${sugestao.nome} (${sugestao.codigo})`;

                div.appendChild(divPrincipal);
                div.appendChild(divSecundaria);

                div.addEventListener('click', () => {
                    input.value = `${sugestao.cidade} - ${sugestao.codigo}`;
                    input.dataset.codigo = sugestao.codigo;
                    container.style.display = 'none';
                    // Salva os dados da busca quando uma sugestão é selecionada
                    salvarDadosBusca();
                });
                container.appendChild(div);
            });
        } else {
            container.style.display = 'none';
        }
    }

    inputOrigem.addEventListener('input', (e) => {
        mostrarSugestoes(inputOrigem, sugestoesOrigem, e.target.value);
    });

    inputDestino.addEventListener('input', (e) => {
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

    function mostrarErro(mensagem) {
        errorDiv.textContent = mensagem;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    async function buscarVoos() {
        console.log('Iniciando busca de voos...');
        errorDiv.style.display = 'none';
        resultadosDiv.innerHTML = '';

        // Verifica se temos o código do aeroporto diretamente no dataset
        let origemCodigo = inputOrigem.dataset.codigo;
        let destinoCodigo = inputDestino.dataset.codigo;

        // Se não tiver no dataset, tenta extrair da lista de aeroportos
        if (!origemCodigo) {
            const origemAeroporto = encontrarAeroporto(inputOrigem.value);
            origemCodigo = origemAeroporto ? origemAeroporto.codigo : null;
        }

        if (!destinoCodigo) {
            const destinoAeroporto = encontrarAeroporto(inputDestino.value);
            destinoCodigo = destinoAeroporto ? destinoAeroporto.codigo : null;
        }

        const data = inputData.value;

        console.log('Dados da busca:', {
            origem: inputOrigem.value,
            origemCodigo,
            destino: inputDestino.value,
            destinoCodigo,
            data
        });

        if (!origemCodigo) {
            mostrarErro('Por favor, selecione um aeroporto de origem válido da lista');
            return;
        }

        if (!destinoCodigo) {
            mostrarErro('Por favor, selecione um aeroporto de destino válido da lista');
            return;
        }

        if (!data) {
            mostrarErro('Por favor, selecione uma data para a viagem');
            return;
        }

        if (origemCodigo === destinoCodigo) {
            mostrarErro('Origem e destino não podem ser iguais');
            return;
        }

        loadingDiv.style.display = 'block';
        console.log('Iniciando chamada à API com códigos:', origemCodigo, destinoCodigo);

        try {
            const voos = await searchFlights({
                origem: origemCodigo,
                destino: destinoCodigo,
                data: data
            });

            console.log('Resposta da API:', voos);
            loadingDiv.style.display = 'none';

            if (!voos || voos.length === 0) {
                resultadosDiv.innerHTML = '';
                const noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results';
                noResultsDiv.textContent = 'Nenhum voo encontrado para esta rota e data.';
                resultadosDiv.appendChild(noResultsDiv);
                return;
            }

            // Limpar os resultados anteriores
            while (resultadosDiv.firstChild) {
                resultadosDiv.removeChild(resultadosDiv.firstChild);
            }

            // Criar e exibir o comparativo de preços
            const comparativoPrecos = criarComparativoPrecos(voos);
            if (comparativoPrecos) {
                resultadosDiv.appendChild(comparativoPrecos);
            }

            voos.forEach(voo => {
                try {
                    // Verifica se temos todos os dados necessários
                    if (!voo.horarioPartida || !voo.horarioChegada || !voo.duracao || !voo.preco) {
                        console.error('Dados incompletos para o voo:', voo);
                        return; // Pula este voo
                    }

                    const card = criarCartaoVoo(voo);
                    resultadosDiv.appendChild(card);
                } catch (error) {
                    console.error('Erro ao criar cartão de voo:', error, voo);
                }
            });
        } catch (erro) {
            console.error('Erro detalhado:', erro);
            loadingDiv.style.display = 'none';
            mostrarErro(`Erro ao buscar voos: ${erro.message}`);
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
        salvarDadosBusca();
        buscarVoos();
    });
});