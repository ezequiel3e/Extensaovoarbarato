/**
 * Controlador para gerenciar a busca de voos
 */
import { searchFlights } from '../services/flightService.js';
import { validarParametrosBusca, normalizarParametroBusca } from '../utils/validacao.js';
import {
    salvarUltimaBusca,
    salvarUltimosResultados,
    carregarUltimaBusca,
    carregarUltimosResultados
} from '../utils/storage.js';

// Elementos DOM que serão inicializados
let inputOrigem;
let inputDestino;
let inputData;
let btnBuscar;
let loadingDiv;
let resultadosDiv;

/**
 * Inicializa o controlador de busca
 */
export function inicializarControladorBusca() {
    console.log('Iniciando controlador de busca...');

    // Obter referências aos elementos DOM
    inputOrigem = document.getElementById('origem');
    inputDestino = document.getElementById('destino');
    inputData = document.getElementById('data');
    btnBuscar = document.getElementById('buscar');
    loadingDiv = document.getElementById('loading');
    resultadosDiv = document.getElementById('resultados');

    // Criar o elemento resultadosDiv se não existir
    if (!resultadosDiv) {
        console.log('Elemento resultadosDiv não encontrado, criando dinamicamente');
        resultadosDiv = document.createElement('div');
        resultadosDiv.id = 'resultados';

        // Encontrar um local adequado para inserir
        const main = document.querySelector('main');
        if (main) {
            main.appendChild(resultadosDiv);
            console.log('Elemento resultadosDiv criado e adicionado ao main');
        } else if (document.body) {
            document.body.appendChild(resultadosDiv);
            console.log('Elemento resultadosDiv criado e adicionado ao body');
        } else {
            console.error('Não foi possível encontrar um elemento pai adequado para resultadosDiv');
        }
    }

    // Criar loadingDiv se não existir
    if (!loadingDiv) {
        console.log('Elemento loadingDiv não encontrado, criando dinamicamente');
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.className = 'loading';
        loadingDiv.style.display = 'none';

        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loadingDiv.appendChild(spinner);

        const loadingText = document.createElement('p');
        loadingText.textContent = 'Buscando os melhores voos para você...';
        loadingDiv.appendChild(loadingText);

        // Adicionar antes do resultadosDiv
        resultadosDiv.parentNode.insertBefore(loadingDiv, resultadosDiv);
    }

    if (!btnBuscar) {
        console.error('Botão de busca não encontrado. Inicialização cancelada.');
        return;
    }

    // Define a data mínima como hoje
    definirDataMinima();

    // Carregar última busca
    restaurarUltimaBusca();

    console.log('Controlador de busca inicializado com sucesso.');

    // Verificar elementos inicializados
    console.log('Elementos inicializados:', {
        inputOrigem: !!inputOrigem,
        inputDestino: !!inputDestino,
        inputData: !!inputData,
        btnBuscar: !!btnBuscar,
        loadingDiv: !!loadingDiv,
        resultadosDiv: !!resultadosDiv
    });
}

/**
 * Restaura os dados da última busca
 */
function restaurarUltimaBusca() {
    const ultimaBusca = carregarUltimaBusca();
    if (!ultimaBusca) return;

    // Preencher os campos com os dados salvos
    if (inputOrigem) {
        inputOrigem.value = ultimaBusca.origem.texto;
        inputOrigem.dataset.codigo = ultimaBusca.origem.codigo;
    }

    if (inputDestino) {
        inputDestino.value = ultimaBusca.destino.texto;
        inputDestino.dataset.codigo = ultimaBusca.destino.codigo;
    }

    if (inputData) {
        inputData.value = ultimaBusca.data;
    }

    // Carregar e exibir os últimos resultados
    const dadosResultados = carregarUltimosResultados();
    if (dadosResultados) {
        const horasPassadas = Math.round((Date.now() - dadosResultados.timestamp) / (1000 * 60 * 60));

        // Adicionar aviso de que são resultados salvos
        const avisoResultadosSalvos = document.createElement('div');
        avisoResultadosSalvos.className = 'aviso-sistema info';
        avisoResultadosSalvos.innerHTML = `
            <p>Mostrando resultados da última busca realizada há ${horasPassadas} hora(s).</p>
            <p>Clique em "Buscar" para atualizar os resultados.</p>
        `;
        resultadosDiv.appendChild(avisoResultadosSalvos);

        // Exibir os resultados salvos
        exibirResultados(dadosResultados.voos);
    }
}

/**
 * Define a data mínima como hoje
 */
function definirDataMinima() {
    if (inputData) {
        const hoje = new Date().toISOString().split('T')[0];
        inputData.min = hoje;

        // Se não houver data selecionada, definir como hoje
        if (!inputData.value) {
            inputData.value = hoje;
        }
    }
}

/**
 * Obtém os parâmetros de busca dos inputs
 * @returns {Object|null} Parâmetros de busca ou null se inválidos
 */
function obterParametrosBusca() {
    if (!inputOrigem || !inputDestino || !inputData) {
        console.error('Elementos de formulário não encontrados');
        return null;
    }

    const origem = inputOrigem.dataset.codigo || extrairCodigoIATA(inputOrigem.value);
    const destino = inputDestino.dataset.codigo || extrairCodigoIATA(inputDestino.value);
    const data = inputData.value;

    if (!origem) {
        alert('Por favor, selecione um aeroporto de origem válido.');
        return null;
    }

    if (!destino) {
        alert('Por favor, selecione um aeroporto de destino válido.');
        return null;
    }

    if (!data) {
        alert('Por favor, selecione uma data para a viagem.');
        return null;
    }

    if (origem === destino) {
        alert('Origem e destino não podem ser iguais.');
        return null;
    }

    return {
        origin: origem,
        destination: destino,
        date: data
    };
}

/**
 * Realiza a busca de voos
 */
export async function realizarBusca() {
    // Obter e validar parâmetros
    const params = obterParametrosBusca();
    if (!params) return;

    // Mostrar loading
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }

    try {
        console.log('Iniciando busca com parâmetros:', params);

        // Salvar parâmetros da busca
        salvarUltimaBusca(params, inputOrigem.value, inputDestino.value);

        // Executar busca
        const response = await searchFlights(params);

        // Processar resultados
        processarResultadosBusca(response);
    } catch (error) {
        console.error('Erro na busca:', error);

        // Esconder loading
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }

        // Mostrar erro
        alert(`Erro ao buscar voos: ${error.message}`);
    }
}

/**
 * Processa os resultados da busca
 * @param {Object} response - Resposta da API
 */
function processarResultadosBusca(response) {
    console.log('Processando resultados da busca:', response);

    // Esconder loading
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }

    // Limpar resultados anteriores
    if (resultadosDiv) {
        resultadosDiv.innerHTML = '';
    } else {
        console.error('Div de resultados não encontrada');
        return;
    }

    // Verificar se há erro na resposta
    if (response.error) {
        try {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error';
            errorMsg.textContent = response.error;
            resultadosDiv.appendChild(errorMsg);
        } catch (error) {
            console.error('Erro ao exibir mensagem de erro:', error);
            alert('Erro: ' + response.error);
        }
        return;
    }

    // Verificar se há resultados
    const voos = response.results || response.voos || [];

    if (voos.length === 0) {
        try {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'no-results';
            emptyMsg.textContent = 'Nenhum voo encontrado para esta rota e data.';
            resultadosDiv.appendChild(emptyMsg);
        } catch (error) {
            console.error('Erro ao exibir mensagem de nenhum resultado:', error);
            alert('Nenhum voo encontrado para esta rota e data.');
        }
        return;
    }

    // Salvar resultados
    salvarUltimosResultados(voos);

    // Exibir resultados
    try {
        exibirResultados(voos);
    } catch (error) {
        console.error('Erro ao exibir resultados:', error);
        // Tentar abordagem alternativa
        exibirResultadosBasico(voos);
    }
}

/**
 * Exibe os resultados da busca
 * @param {Array} voos - Lista de voos encontrados
 */
function exibirResultados(voos) {
    // Adicionar aviso informativo
    const avisoDiv = document.createElement('div');
    avisoDiv.className = 'aviso-preco';
    avisoDiv.textContent = 'Ao reservar, você será direcionado para o site oficial da companhia aérea para completar sua compra.';
    resultadosDiv.appendChild(avisoDiv);

    // Exibir cada voo
    voos.forEach(voo => {
        try {
            const card = criarCartaoVoo(voo);
            resultadosDiv.appendChild(card);
        } catch (error) {
            console.error('Erro ao criar cartão para voo:', error, voo);
        }
    });
}

/**
 * Exibe os resultados de forma básica (fallback)
 * @param {Array} voos - Lista de voos encontrados
 */
function exibirResultadosBasico(voos) {
    // Criar tabela simples para exibir os resultados
    const tabela = document.createElement('table');
    tabela.className = 'tabela-voos-simples';

    // Criar cabeçalho
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Companhia</th>
            <th>Voo</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Data/Hora</th>
            <th>Preço</th>
        </tr>
    `;
    tabela.appendChild(thead);

    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    voos.forEach(voo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${voo.airline || voo.airlineName || voo.airlineCode || '---'}</td>
            <td>${voo.flightNumber || '---'}</td>
            <td>${voo.origin || voo.originCode || '---'}</td>
            <td>${voo.destination || voo.destinationCode || '---'}</td>
            <td>${voo.departureDate || voo.departureDateTime || '---'}</td>
            <td>${voo.currency || 'R$'} ${voo.price || voo.priceWithDiscount || '---'}</td>
        `;
        tbody.appendChild(tr);
    });
    tabela.appendChild(tbody);

    // Adicionar à div de resultados
    resultadosDiv.appendChild(tabela);
}

// Função auxiliar para extrair código IATA
function extrairCodigoIATA(texto) {
    if (!texto) return '';
    const match = texto.match(/\s-\s([A-Z]{3})$/);
    return match ? match[1] : '';
}