// Este script corrige as sugestões de aeroportos para os campos de origem e destino
console.log('fixSugestoes.js carregado');

// Lista de aeroportos principais para sugestões
const aeroportosPrincipais = [
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

// Função para validar código IATA
function validarCodigoIATA(codigo) {
    if (!codigo) return false;

    // Verifica se é um código IATA válido (3 letras maiúsculas)
    const regexIATA = /^[A-Z]{3}$/;
    return regexIATA.test(codigo);
}

// Função para extrair código IATA de uma string
function extrairCodigoIATA(texto) {
    if (!texto) return null;

    // Tenta extrair um código IATA de 3 letras do texto
    const match = texto.toUpperCase().match(/\b([A-Z]{3})\b/);
    return match ? match[1] : null;
}

// Função para obter informações de um aeroporto pelo código
function obterAeroportoPorCodigo(codigo) {
    if (!codigo) return null;

    return aeroportosPrincipais.find(aeroporto =>
        aeroporto.codigo.toUpperCase() === codigo.toUpperCase()
    );
}

// Função para criar a lista de sugestões
function criarListaSugestoesAeroportos(input, lista) {
    if (!input || !lista) return;

    // Verificar se a lista já existe
    if (lista.children.length > 0) {
        // Lista já existe, apenas garantir que esteja escondida
        lista.style.display = 'none';
        return;
    }

    // Adicionar estilo para a lista de sugestões se ainda não existir
    const estiloSugestoes = document.getElementById('estilo-sugestoes');
    if (!estiloSugestoes) {
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
                padding: 10px;
            }
            
            .input-feedback {
                font-size: 12px;
                margin-top: 5px;
                transition: all 0.3s ease;
            }
            
            .input-valido {
                color: #4CAF50;
            }
            
            .input-invalido {
                color: #F44336;
            }
        `;
        document.head.appendChild(style);
    }
}

// Função para selecionar item com teclado
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

// Função para confirmar seleção atual
function confirmarSelecao(input, container) {
    const itens = container.querySelectorAll('.sugestao-item');
    if (indiceSelecionado >= 0 && indiceSelecionado < itens.length) {
        const itemSelecionado = itens[indiceSelecionado];
        input.value = `${itemSelecionado.dataset.cidade} - ${itemSelecionado.dataset.codigo}`;
        input.dataset.codigo = itemSelecionado.dataset.codigo;
        container.style.display = 'none';

        // Passar para o próximo campo se for o de origem
        if (input.id === 'origem') {
            const campoDestino = document.getElementById('destino');
            if (campoDestino) {
                setTimeout(() => campoDestino.focus(), 100);
            }
        } else if (input.id === 'destino') {
            const campoData = document.getElementById('data');
            if (campoData) {
                setTimeout(() => campoData.focus(), 100);
            }
        }
    }
}

// Função para verificar se o texto é um código IATA direto
function verificarCodigoIATADireto(input, valor) {
    // Remove qualquer feedback anterior
    const feedbackExistente = input.parentNode.querySelector('.input-feedback');
    if (feedbackExistente) {
        feedbackExistente.remove();
    }

    // Verifica se o texto é exatamente um código IATA
    if (validarCodigoIATA(valor)) {
        // É um código IATA válido
        input.dataset.codigo = valor;

        // Adiciona feedback visual
        const feedback = document.createElement('div');
        feedback.className = 'input-feedback input-valido';
        feedback.textContent = `Código IATA válido: ${valor}`;
        input.parentNode.appendChild(feedback);

        // Tenta obter informações do aeroporto
        const aeroporto = obterAeroportoPorCodigo(valor);
        if (aeroporto) {
            // Atualiza o valor com as informações completas
            input.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;

            // Remover o feedback após 2 segundos
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 2000);

            return true;
        }

        return true;
    } else if (valor.length === 3 && /^[A-Za-z]{3}$/.test(valor)) {
        // Código com formato correto, mas em minúsculo
        const codigoMaiusculo = valor.toUpperCase();
        input.dataset.codigo = codigoMaiusculo;

        // Adiciona feedback
        const feedback = document.createElement('div');
        feedback.className = 'input-feedback input-valido';
        feedback.textContent = `Código IATA: ${codigoMaiusculo}`;
        input.parentNode.appendChild(feedback);

        // Tenta obter informações do aeroporto
        const aeroporto = obterAeroportoPorCodigo(codigoMaiusculo);
        if (aeroporto) {
            // Atualiza o valor com as informações completas
            input.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;

            // Remover o feedback após 2 segundos
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 2000);
        }

        return true;
    }

    // Tenta extrair um código IATA do texto
    const codigoExtraido = extrairCodigoIATA(valor);
    if (codigoExtraido) {
        input.dataset.codigo = codigoExtraido;

        // Adiciona feedback
        const feedback = document.createElement('div');
        feedback.className = 'input-feedback input-valido';
        feedback.textContent = `Código IATA encontrado: ${codigoExtraido}`;
        input.parentNode.appendChild(feedback);

        // Remover o feedback após 2 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 2000);

        return true;
    }

    return false;
}

// Função para mostrar sugestões
function mostrarSugestoesAeroportos(input, container, termo) {
    if (!input || !container) return;

    console.log('Mostrando sugestões para:', termo);

    // Resetar o índice selecionado
    indiceSelecionado = -1;

    if (!termo || termo.length < 2) {
        container.style.display = 'none';
        return;
    }

    // Verifica se o termo é um código IATA direto
    if (verificarCodigoIATADireto(input, termo)) {
        // Se for um código IATA válido, não precisa mostrar sugestões
        container.style.display = 'none';
        return;
    }

    // Primeiro busca localmente
    const sugestoes = aeroportosPrincipais.filter(aeroporto =>
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

                    // Passar para o próximo campo após seleção
                    if (input.id === 'origem') {
                        const campoDestino = document.getElementById('destino');
                        if (campoDestino) {
                            setTimeout(() => campoDestino.focus(), 100);
                        }
                    } else if (input.id === 'destino') {
                        const campoData = document.getElementById('data');
                        if (campoData) {
                            setTimeout(() => campoData.focus(), 100);
                        }
                    }
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

// Função para verificar o valor ao sair do campo
function validarCampoAoSair(input) {
    const valor = input.value.trim();

    // Se o campo estiver vazio, não fazer nada
    if (!valor) return;

    // Se já tem um código IATA definido, está válido
    if (input.dataset.codigo && validarCodigoIATA(input.dataset.codigo)) {
        return;
    }

    // Tenta extrair um código IATA do valor atual
    const codigoExtraido = extrairCodigoIATA(valor);
    if (codigoExtraido) {
        input.dataset.codigo = codigoExtraido;

        // Procura informações do aeroporto
        const aeroporto = obterAeroportoPorCodigo(codigoExtraido);
        if (aeroporto) {
            input.value = `${aeroporto.cidade} - ${aeroporto.codigo}`;
        } else {
            // Se não encontrou informações, deixa apenas o código
            input.value = codigoExtraido;
        }
    } else {
        // Se não encontrou código IATA, limpa o dataset e mostra um alerta
        delete input.dataset.codigo;

        // Adiciona feedback de erro
        const feedback = document.createElement('div');
        feedback.className = 'input-feedback input-invalido';
        feedback.textContent = 'Por favor, selecione um aeroporto válido da lista ou digite um código IATA de 3 letras.';

        // Remove qualquer feedback anterior
        const feedbackExistente = input.parentNode.querySelector('.input-feedback');
        if (feedbackExistente) {
            feedbackExistente.remove();
        }

        input.parentNode.appendChild(feedback);

        // Remove o feedback após 3 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 3000);
    }
}

// Função para configurar campos de autosugestão
function configurarCamposSugestoes() {
    const inputOrigem = document.getElementById('origem');
    const inputDestino = document.getElementById('destino');
    const sugestoesOrigem = document.getElementById('sugestoes-origem');
    const sugestoesDestino = document.getElementById('sugestoes-destino');

    if (!inputOrigem || !inputDestino || !sugestoesOrigem || !sugestoesDestino) {
        console.error('Elementos de sugestão não encontrados');
        return;
    }

    // Criar listas de sugestões
    criarListaSugestoesAeroportos(inputOrigem, sugestoesOrigem);
    criarListaSugestoesAeroportos(inputDestino, sugestoesDestino);

    // Adicionar event listeners apenas se ainda não existirem
    if (!inputOrigem.hasAttribute('data-sugestoes-configuradas')) {
        inputOrigem.setAttribute('data-sugestoes-configuradas', 'true');

        // Evento para digitar no campo
        inputOrigem.addEventListener('input', (e) => {
            // Limpa o código armazenado quando o usuário digita
            delete inputOrigem.dataset.codigo;
            mostrarSugestoesAeroportos(inputOrigem, sugestoesOrigem, e.target.value);
        });

        // Evento para teclas especiais
        inputOrigem.addEventListener('keydown', (e) => {
            if (sugestoesOrigem.style.display === 'block') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selecionarItem(sugestoesOrigem, 'baixo');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selecionarItem(sugestoesOrigem, 'cima');
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmarSelecao(inputOrigem, sugestoesOrigem);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    sugestoesOrigem.style.display = 'none';
                    indiceSelecionado = -1;
                }
            } else if (e.key === 'Enter') {
                // Se pressionar Enter quando não há sugestões, verifica o valor atual
                e.preventDefault();
                validarCampoAoSair(inputOrigem);

                // Se for válido, passa para o próximo campo
                if (inputOrigem.dataset.codigo) {
                    const campoDestino = document.getElementById('destino');
                    if (campoDestino) {
                        setTimeout(() => campoDestino.focus(), 100);
                    }
                }
            }
        });

        // Evento para foco no campo
        inputOrigem.addEventListener('focus', () => {
            if (inputOrigem.value.length >= 2) {
                mostrarSugestoesAeroportos(inputOrigem, sugestoesOrigem, inputOrigem.value);
            }
        });

        // Evento para quando sair do campo
        inputOrigem.addEventListener('blur', () => {
            // Pequeno atraso para permitir que o clique na sugestão seja processado primeiro
            setTimeout(() => {
                if (sugestoesOrigem.style.display !== 'none') {
                    sugestoesOrigem.style.display = 'none';
                }

                validarCampoAoSair(inputOrigem);
            }, 200);
        });

        console.log('Event listeners adicionados ao campo de origem');
    }

    if (!inputDestino.hasAttribute('data-sugestoes-configuradas')) {
        inputDestino.setAttribute('data-sugestoes-configuradas', 'true');

        // Evento para digitar no campo
        inputDestino.addEventListener('input', (e) => {
            // Limpa o código armazenado quando o usuário digita
            delete inputDestino.dataset.codigo;
            mostrarSugestoesAeroportos(inputDestino, sugestoesDestino, e.target.value);
        });

        // Evento para teclas especiais
        inputDestino.addEventListener('keydown', (e) => {
            if (sugestoesDestino.style.display === 'block') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selecionarItem(sugestoesDestino, 'baixo');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selecionarItem(sugestoesDestino, 'cima');
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmarSelecao(inputDestino, sugestoesDestino);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    sugestoesDestino.style.display = 'none';
                    indiceSelecionado = -1;
                }
            } else if (e.key === 'Enter') {
                // Se pressionar Enter quando não há sugestões, verifica o valor atual
                e.preventDefault();
                validarCampoAoSair(inputDestino);

                // Se for válido, passa para o próximo campo
                if (inputDestino.dataset.codigo) {
                    const campoData = document.getElementById('data');
                    if (campoData) {
                        setTimeout(() => campoData.focus(), 100);
                    }
                }
            }
        });

        // Evento para foco no campo
        inputDestino.addEventListener('focus', () => {
            if (inputDestino.value.length >= 2) {
                mostrarSugestoesAeroportos(inputDestino, sugestoesDestino, inputDestino.value);
            }
        });

        // Evento para quando sair do campo
        inputDestino.addEventListener('blur', () => {
            // Pequeno atraso para permitir que o clique na sugestão seja processado primeiro
            setTimeout(() => {
                if (sugestoesDestino.style.display !== 'none') {
                    sugestoesDestino.style.display = 'none';
                }

                validarCampoAoSair(inputDestino);
            }, 200);
        });

        console.log('Event listeners adicionados ao campo de destino');
    }

    // Adicionar event listener global para fechar as sugestões quando clicar fora
    if (!document.body.hasAttribute('data-sugestoes-click-handler')) {
        document.body.setAttribute('data-sugestoes-click-handler', 'true');
        document.addEventListener('click', (e) => {
            if (!sugestoesOrigem.contains(e.target) && e.target !== inputOrigem) {
                sugestoesOrigem.style.display = 'none';
            }
            if (!sugestoesDestino.contains(e.target) && e.target !== inputDestino) {
                sugestoesDestino.style.display = 'none';
            }
        });

        console.log('Event listener global para fechar sugestões adicionado');
    }
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarCamposSugestoes);
} else {
    configurarCamposSugestoes();
}

// Também verificar quando a janela estiver completamente carregada
window.addEventListener('load', configurarCamposSugestoes);

// Verificar novamente após 2 segundos
setTimeout(configurarCamposSugestoes, 2000);