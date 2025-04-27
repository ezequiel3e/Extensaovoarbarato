/**
 * Utilitário para gerenciar sugestões de aeroportos nos campos de busca
 */
import { validarCodigoIATA, CODIGOS_IATA_BR } from './validacao.js';

// Lista completa de aeroportos para sugestões
const aeroportos = [
    // São Paulo
    { codigo: 'GRU', nome: 'São Paulo - Guarulhos', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'CGH', nome: 'São Paulo - Congonhas', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'VCP', nome: 'Campinas - Viracopos', cidade: 'Campinas', estado: 'SP' },
    // Rio de Janeiro
    { codigo: 'GIG', nome: 'Rio de Janeiro - Galeão', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'SDU', nome: 'Rio de Janeiro - Santos Dumont', cidade: 'Rio de Janeiro', estado: 'RJ' },
    // Nordeste
    { codigo: 'REC', nome: 'Recife - Guararapes', cidade: 'Recife', estado: 'PE' },
    { codigo: 'SSA', nome: 'Salvador - Luis E. Magalhães', cidade: 'Salvador', estado: 'BA' },
    { codigo: 'FOR', nome: 'Fortaleza - Pinto Martins', cidade: 'Fortaleza', estado: 'CE' },
    { codigo: 'SLZ', nome: 'São Luís - Marechal Cunha Machado', cidade: 'São Luís', estado: 'MA' },
    { codigo: 'NAT', nome: 'Natal - Augusto Severo', cidade: 'Natal', estado: 'RN' },
    { codigo: 'MCZ', nome: 'Maceió - Zumbi dos Palmares', cidade: 'Maceió', estado: 'AL' },
    { codigo: 'JPA', nome: 'João Pessoa - Castro Pinto', cidade: 'João Pessoa', estado: 'PB' },
    { codigo: 'AJU', nome: 'Aracaju - Santa Maria', cidade: 'Aracaju', estado: 'SE' },
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
    { codigo: 'VIX', nome: 'Vitória - Eurico Salles', cidade: 'Vitória', estado: 'ES' }
];

// Armazenar o índice da sugestão selecionada
let indiceSelecionado = -1;

/**
 * Inicializa o sistema de sugestões para campos de aeroporto
 */
export function inicializarSugestoes() {
    // Obter referências aos elementos DOM
    const inputOrigem = document.getElementById('origem');
    const inputDestino = document.getElementById('destino');
    const sugestoesOrigem = document.getElementById('sugestoes-origem');
    const sugestoesDestino = document.getElementById('sugestoes-destino');

    // Adicionar estilos CSS necessários
    adicionarEstilosSugestoes();

    // Configurar campos de origem e destino
    if (inputOrigem && sugestoesOrigem) {
        configurarCampoSugestoes(inputOrigem, sugestoesOrigem);
    }

    if (inputDestino && sugestoesDestino) {
        configurarCampoSugestoes(inputDestino, sugestoesDestino);
    }

    // Esconder sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (sugestoesOrigem && !sugestoesOrigem.contains(e.target) && e.target !== inputOrigem) {
            sugestoesOrigem.style.display = 'none';
        }
        if (sugestoesDestino && !sugestoesDestino.contains(e.target) && e.target !== inputDestino) {
            sugestoesDestino.style.display = 'none';
        }
    });

    console.log('Sistema de sugestões inicializado com sucesso.');
}

/**
 * Adiciona os estilos CSS necessários para as sugestões
 */
function adicionarEstilosSugestoes() {
    // Verificar se os estilos já foram adicionados
    if (document.getElementById('estilo-sugestoes')) return;

    const style = document.createElement('style');
    style.id = 'estilo-sugestoes';
    style.textContent = `
        .sugestoes-container {
            position: absolute;
            width: 100%;
            max-height: 300px;
            overflow-y: auto;
            background-color: white;
            border: 1px solid #ccc;
            border-top: none;
            border-radius: 0 0 4px 4px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            display: none;
        }
        
        .sugestao-item {
            padding: 10px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .sugestao-item:hover {
            background-color: #f5f5f5;
        }
        
        .sugestao-item.selecionado {
            background-color: #e3f2fd;
            border-left: 3px solid #1976D2;
        }
        
        .sugestao-titulo {
            padding: 10px;
            font-weight: bold;
            background-color: #f0f0f0;
            border-bottom: 1px solid #ddd;
        }
        
        .sugestao-info {
            padding: 10px;
            color: #666;
            font-style: italic;
            border-bottom: 1px solid #eee;
        }
        
        .sugestao-sem-resultados {
            padding: 15px;
            color: #666;
            text-align: center;
            font-style: italic;
        }
        
        .codigo-iata-direto {
            background-color: #e8f5e9;
            border-left: 3px solid #4CAF50;
        }
        
        .input-feedback {
            font-size: 12px;
            margin-top: 5px;
            color: #4CAF50;
        }
        
        .input-invalido {
            border-color: #f44336 !important;
        }
        
        .input-disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Configura um campo para mostrar sugestões de aeroportos
 * @param {HTMLElement} input - Campo de entrada
 * @param {HTMLElement} container - Container para sugestões
 */
function configurarCampoSugestoes(input, container) {
    // Configurar evento de input para mostrar sugestões
    input.addEventListener('input', (e) => {
        mostrarSugestoes(input, container, e.target.value);
    });

    // Configurar eventos de teclado
    input.addEventListener('keydown', (e) => {
        if (container.style.display === 'none') return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selecionarItem(container, 'baixo');
                break;
            case 'ArrowUp':
                e.preventDefault();
                selecionarItem(container, 'cima');
                break;
            case 'Enter':
                e.preventDefault();
                confirmarSelecao(input, container);
                break;
            case 'Escape':
                e.preventDefault();
                container.style.display = 'none';
                break;
        }
    });

    // Configurar validação ao sair do campo
    input.addEventListener('blur', (e) => {
        // Aguarda um pouco para não interferir com a seleção de item
        setTimeout(() => {
            validarCampoAoSair(input);
        }, 200);
    });

    // Limpar o dataset ao limpar o campo
    input.addEventListener('change', (e) => {
        if (input.value === '') {
            delete input.dataset.codigo;
        }
    });
}

/**
 * Mostra sugestões para um campo de aeroporto
 * @param {HTMLElement} input - Campo de entrada
 * @param {HTMLElement} container - Container para sugestões
 * @param {string} termo - Termo de busca
 */
export function mostrarSugestoes(input, container, termo) {
    // Resetar a seleção
    indiceSelecionado = -1;

    // Se o termo for vazio, esconder as sugestões
    if (!termo || termo.trim() === '') {
        container.style.display = 'none';
        return;
    }

    // Verifica se é um código IATA direto
    if (validarCodigoIATA(termo.trim())) {
        input.dataset.codigo = termo.trim();

        // Verificar se o código existe no dicionário
        const nomeAeroporto = CODIGOS_IATA_BR[termo.trim()];
        if (nomeAeroporto) {
            input.value = `${nomeAeroporto} - ${termo.trim()}`;
            container.style.display = 'none';
            return;
        }
    }

    // Limpar sugestões anteriores
    container.innerHTML = '';

    // Filtrar aeroportos pelo termo de busca
    const termoBusca = termo.toLowerCase();
    const resultados = aeroportos.filter(aeroporto => {
        return aeroporto.codigo.toLowerCase().includes(termoBusca) ||
            aeroporto.nome.toLowerCase().includes(termoBusca) ||
            aeroporto.cidade.toLowerCase().includes(termoBusca);
    });

    // Se não houver resultados
    if (resultados.length === 0) {
        const semResultados = document.createElement('div');
        semResultados.className = 'sugestao-sem-resultados';
        semResultados.textContent = 'Nenhum aeroporto encontrado';
        container.appendChild(semResultados);
    } else {
        // Adicionar cabeçalho
        const titulo = document.createElement('div');
        titulo.className = 'sugestao-titulo';
        titulo.textContent = 'Aeroportos encontrados';
        container.appendChild(titulo);

        // Adicionar resultados
        resultados.forEach(aeroporto => {
            const item = document.createElement('div');
            item.className = 'sugestao-item';
            item.dataset.codigo = aeroporto.codigo;
            item.dataset.cidade = aeroporto.cidade;

            item.innerHTML = `
                <strong>${aeroporto.cidade}</strong> - ${aeroporto.nome}
                <span class="aeroporto-codigo">${aeroporto.codigo}</span>
            `;

            // Adicionar eventos ao item
            item.addEventListener('click', () => {
                input.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;
                input.dataset.codigo = aeroporto.codigo;
                container.style.display = 'none';

                // Passar para o próximo campo
                if (input.id === 'origem') {
                    const campoDestino = document.getElementById('destino');
                    if (campoDestino) {
                        setTimeout(() => campoDestino.focus(), 100);
                    }
                } else if (input.id === 'destino') {
                    const campoData = document.getElementById('data');
                    if (campoData && !campoData.disabled) {
                        setTimeout(() => campoData.focus(), 100);
                    } else {
                        const btnBuscar = document.getElementById('buscar');
                        if (btnBuscar) {
                            setTimeout(() => btnBuscar.focus(), 100);
                        }
                    }
                }
            });

            container.appendChild(item);
        });
    }

    // Mostrar sugestões
    container.style.display = 'block';
}

/**
 * Seleciona um item da lista de sugestões com as teclas de seta
 * @param {HTMLElement} container - Container com as sugestões
 * @param {string} direcao - Direção da seleção ('cima' ou 'baixo')
 */
function selecionarItem(container, direcao) {
    const itens = container.querySelectorAll('.sugestao-item');
    if (itens.length === 0) return;

    // Remover seleção atual
    if (indiceSelecionado >= 0 && indiceSelecionado < itens.length) {
        itens[indiceSelecionado].classList.remove('selecionado');
    }

    // Atualizar índice
    if (direcao === 'cima') {
        indiceSelecionado = indiceSelecionado <= 0 ? itens.length - 1 : indiceSelecionado - 1;
    } else if (direcao === 'baixo') {
        indiceSelecionado = indiceSelecionado >= itens.length - 1 ? 0 : indiceSelecionado + 1;
    }

    // Aplicar nova seleção
    itens[indiceSelecionado].classList.add('selecionado');

    // Garantir que o item selecionado esteja visível
    itens[indiceSelecionado].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

/**
 * Confirma a seleção de um item da lista
 * @param {HTMLElement} input - Campo de entrada
 * @param {HTMLElement} container - Container com as sugestões
 */
function confirmarSelecao(input, container) {
    const itens = container.querySelectorAll('.sugestao-item');
    if (indiceSelecionado >= 0 && indiceSelecionado < itens.length) {
        const itemSelecionado = itens[indiceSelecionado];
        input.value = `${itemSelecionado.dataset.cidade} - ${itemSelecionado.dataset.codigo}`;
        input.dataset.codigo = itemSelecionado.dataset.codigo;
        container.style.display = 'none';

        // Passar para o próximo campo
        if (input.id === 'origem') {
            const campoDestino = document.getElementById('destino');
            if (campoDestino) {
                campoDestino.focus();
            }
        } else if (input.id === 'destino') {
            const campoData = document.getElementById('data');
            if (campoData && !campoData.disabled) {
                campoData.focus();
            } else {
                const btnBuscar = document.getElementById('buscar');
                if (btnBuscar) {
                    btnBuscar.focus();
                }
            }
        }
    }
}

/**
 * Valida um campo de aeroporto quando o usuário sai dele
 * @param {HTMLElement} input - Campo de entrada
 */
function validarCampoAoSair(input) {
    const valor = input.value.trim();

    // Se o campo estiver vazio, não precisa validar
    if (!valor) {
        delete input.dataset.codigo;
        input.classList.remove('input-invalido');
        return;
    }

    // Se já tiver um código válido no dataset, está tudo certo
    if (input.dataset.codigo && validarCodigoIATA(input.dataset.codigo)) {
        input.classList.remove('input-invalido');
        return;
    }

    // Tentar extrair código do texto
    const match = valor.match(/\s-\s([A-Z]{3})$/);
    if (match && validarCodigoIATA(match[1])) {
        input.dataset.codigo = match[1];
        input.classList.remove('input-invalido');
        return;
    }

    // Se chegou aqui, o valor não é válido
    input.classList.add('input-invalido');
    delete input.dataset.codigo;
}