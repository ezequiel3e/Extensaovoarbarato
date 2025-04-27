export function calcularDuracao(partida, chegada) {
    const inicio = new Date(partida);
    const fim = new Date(chegada);
    const diff = fim - inicio;
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
}

export function formatarHorario(data) {
    return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getLinkReserva(voo) {
    // Debug para verificar os dados recebidos
    console.log('Dados do voo para reserva:', voo);

    // Links simplificados para as páginas principais das companhias aéreas como fallback
    const linksCompanhias = {
        'LATAM': 'https://www.latamairlines.com/br/pt',
        'GOL': 'https://www.voegol.com.br',
        'Azul': 'https://www.voeazul.com.br',
        'American Airlines': 'https://www.aa.com/br/pt',
        'Delta': 'https://www.delta.com/br/pt',
        'Copa Airlines': 'https://www.copaair.com/pt/web/br',
        'TAP Portugal': 'https://www.flytap.com/pt-br',
        'United': 'https://www.united.com/pt/br',
        'Avianca': 'https://www.avianca.com/br/pt',
        'Emirates': 'https://www.emirates.com/br/portuguese',
        'LATAM Airlines': 'https://www.latamairlines.com/br/pt',
        'GOL Linhas Aéreas': 'https://www.voegol.com.br',
        'Azul Linhas Aéreas': 'https://www.voeazul.com.br',

        // Códigos IATA das companhias
        'LA': 'https://www.latamairlines.com/br/pt',
        'G3': 'https://www.voegol.com.br',
        'AD': 'https://www.voeazul.com.br',
        'AA': 'https://www.aa.com/br/pt',
        'DL': 'https://www.delta.com/br/pt',
        'CM': 'https://www.copaair.com/pt/web/br',
        'TP': 'https://www.flytap.com/pt-br',
        'UA': 'https://www.united.com/pt/br',
        'AV': 'https://www.avianca.com/br/pt'
    };

    // Verificar se temos um link direto para a companhia como fallback imediato
    const linkFallback = linksCompanhias[voo.companhia] || linksCompanhias[voo.codigoCompanhia];

    // Mapear os dados do voo para o formato esperado pelo serviço de redirecionamento
    const flightData = {
        origem: voo.origem,
        destino: voo.destino,
        data: voo.partida ? voo.partida.split('T')[0] : new Date().toISOString().split('T')[0],
        companhia: voo.companhia,
        codigoCompanhia: voo.codigoCompanhia
    };

    // Guardar o link de fallback para uso posterior
    if (linkFallback) {
        window.lastRedirectUrl = linkFallback;
    } else {
        window.lastRedirectUrl = 'https://www.google.com/travel/flights';
    }

    try {
        // Tentar importação dinâmica (desabilitada temporariamente)
        /* 
        // Importar o serviço de redirecionamento com caminho absoluto
        import('/services/airlineRedirectService.js')
            .then(module => {
                const { getAirlineRedirectUrl } = module;
                const url = getAirlineRedirectUrl(flightData);
                console.log('URL de redirecionamento obtida:', url);
                // Armazenar a URL para uso posterior
                window.lastRedirectUrl = url;
            })
            .catch(err => {
                console.error('Erro ao importar serviço de redirecionamento:', err);
                // Tentar com caminho relativo alternativo como fallback
                console.log('Tentando caminho alternativo...');
                import('../../services/airlineRedirectService.js')
                    .then(module => {
                        const { getAirlineRedirectUrl } = module;
                        const url = getAirlineRedirectUrl(flightData);
                        console.log('URL de redirecionamento obtida (caminho alternativo):', url);
                        window.lastRedirectUrl = url;
                    })
                    .catch(secondErr => {
                        console.error('Falha também no caminho alternativo:', secondErr);
                    });
            });
        */

        // Usando apenas o link fallback por enquanto
        console.log('Usando link direto para a companhia:', window.lastRedirectUrl);
    } catch (error) {
        console.error('Erro ao obter URL de redirecionamento:', error);
    }

    // Verificar se temos um link para a companhia
    if (linkFallback) {
        console.log('Usando página principal para', voo.companhia);
        return linkFallback;
    }

    // Caso não tenhamos link específico, usar o Google Flights
    console.log('Usando Google Flights como fallback');
    return 'https://www.google.com/travel/flights';
}

function criarSVGSeta() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z");

    svg.appendChild(path);
    return svg;
}

/**
 * Utilitário para exibir resultados de voos
 */

// Mapeamento de códigos de companhias aéreas para nomes
const COMPANHIAS_AEREAS = {
    'G3': 'GOL',
    'LA': 'LATAM',
    'JJ': 'LATAM',
    'AD': 'Azul',
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta',
    'AV': 'Avianca',
    'CM': 'Copa Airlines',
    'TP': 'TAP Portugal',
    'EK': 'Emirates',
    '2Z': 'Passaredo',
    'Y8': 'Itapemirim',
    'O6': 'Avianca Brasil'
};

/**
 * Formata um preço para exibição
 * @param {number|string} preco - Preço a ser formatado
 * @param {string} moeda - Código da moeda (padrão: BRL)
 * @returns {string} - Preço formatado
 */
function formatarPreco(preco, moeda = 'BRL') {
    // Converter para número se for string
    const precoNum = typeof preco === 'string' ? parseFloat(preco) : preco;

    // Se não for um número válido, retornar placeholder
    if (isNaN(precoNum)) {
        return 'Preço indisponível';
    }

    // Formatar o preço com o locale brasileiro
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: moeda,
        minimumFractionDigits: 2
    });

    return formatter.format(precoNum);
}

/**
 * Formata uma data para exibição
 * @param {string} data - Data a ser formatada
 * @param {boolean} incluirHora - Se deve incluir a hora na formatação
 * @returns {string} - Data formatada
 */
function formatarData(data, incluirHora = true) {
    if (!data) return 'Data indisponível';

    try {
        const dataObj = new Date(data);

        // Se a data for inválida, retornar o texto original
        if (isNaN(dataObj.getTime())) {
            return data;
        }

        // Formatar a data
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: incluirHora ? '2-digit' : undefined,
            minute: incluirHora ? '2-digit' : undefined
        });

        return formatter.format(dataObj);
    } catch (erro) {
        console.error('Erro ao formatar data:', erro);
        return data;
    }
}

/**
 * Formata a duração de um voo
 * @param {number|string} duracao - Duração em minutos ou formato HH:MM
 * @returns {string} - Duração formatada
 */
function formatarDuracao(duracao) {
    if (!duracao) return 'Duração indisponível';

    let minutos;

    // Verificar se a duração já está no formato HH:MM
    if (typeof duracao === 'string' && duracao.includes(':')) {
        const [horas, mins] = duracao.split(':').map(Number);
        minutos = (horas * 60) + mins;
    } else {
        // Assumir que é o número de minutos
        minutos = parseInt(duracao, 10);
    }

    // Se não for um número válido, retornar o texto original
    if (isNaN(minutos)) {
        return duracao;
    }

    // Calcular horas e minutos
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    // Formatar
    return `${horas}h ${minutosRestantes.toString().padStart(2, '0')}m`;
}

/**
 * Obtém o nome da companhia aérea a partir do código
 * @param {string} codigo - Código IATA da companhia
 * @returns {string} - Nome da companhia
 */
function obterNomeCompanhia(codigo) {
    if (!codigo) return 'Companhia indisponível';

    return COMPANHIAS_AEREAS[codigo] || codigo;
}

/**
 * Utilitário para exibição de voos no formato de cartões
 */

/**
 * Cria um cartão para exibir informações do voo
 * @param {Object} voo - Objeto com informações do voo
 * @returns {HTMLElement} - Elemento DOM do cartão de voo
 */
export function criarCartaoVoo(voo) {
    try {
        if (!voo) {
            console.error('Dados de voo inválidos');
            return criarCartaoErro();
        }

        // Criar elemento do cartão
        const card = document.createElement('div');
        card.className = 'flight-card';

        // Definir classes adicionais para voos especiais
        if (voo.isBestPrice) {
            card.classList.add('melhor-preco');
        } else if (voo.specialOffer) {
            card.classList.add('preco-otimo');
        }

        // Extrair dados do voo com valores padrão caso estejam ausentes
        const companhia = voo.airline || voo.companhia || 'Companhia não informada';
        const origem = voo.origin || voo.origem || 'Origem';
        const destino = voo.destination || voo.destino || 'Destino';
        const precoOriginal = voo.price || voo.preco || 0;
        const precoComDesconto = voo.priceWithDiscount || voo.precoComDesconto || precoOriginal;
        const desconto = voo.discountPercent || 0;
        const horarioPartida = voo.departureTime || voo.horarioPartida || '--:--';
        const horarioChegada = voo.arrivalTime || voo.horarioChegada || '--:--';
        const duracao = voo.duration || voo.duracao || 'não informada';
        const escalas = voo.stops || voo.escalas || 0;

        // Criar conteúdo HTML do cartão
        let cardHTML = `
            <div class="airline-info">
                <div class="airline-name">${companhia}</div>
            </div>
            
            <div class="flight-info">
                <div class="time-info">
                    <div class="departure">
                        <div class="time">${horarioPartida}</div>
                        <div class="airport">${origem}</div>
                    </div>
                    
                    <div class="duration">
                        <div class="duration-line">───────────</div>
                        <div class="duration-time">${duracao}</div>
                        <div class="stops">${escalas > 0 ? `${escalas} ${escalas === 1 ? 'escala' : 'escalas'}` : 'Voo direto'}</div>
                    </div>
                    
                    <div class="arrival">
                        <div class="time">${horarioChegada}</div>
                        <div class="airport">${destino}</div>
                    </div>
                </div>
            </div>
            
            <div class="price-info">
                <div class="price-container">`;
        
        // Adicionar informação de preço com desconto se aplicável
        if (desconto > 0) {
            cardHTML += `
                    <div class="original-price">R$ ${parseFloat(precoOriginal).toFixed(2)}</div>
                    <div class="price-value">R$ ${parseFloat(precoComDesconto).toFixed(2)}</div>
                    <div class="savings-info">Economize ${desconto}%</div>`;
        } else {
            cardHTML += `
                    <div class="price-value">R$ ${parseFloat(precoComDesconto).toFixed(2)}</div>`;
        }
        
        // Finalizar HTML
        cardHTML += `
                </div>
                <button class="reserve-button" data-id="${voo.id || ''}">Reservar</button>
            </div>`;
        
        // Definir o HTML do cartão
        try {
            card.innerHTML = cardHTML;
        } catch (error) {
            console.error('Erro ao definir HTML do cartão:', error);
            // Abordagem alternativa
            card.textContent = `${companhia} - ${origem} para ${destino} - R$ ${parseFloat(precoComDesconto).toFixed(2)}`;
        }
        
        // Adicionar handler de clique no botão de reserva
        try {
            const btnReservar = card.querySelector('.reserve-button');
            if (btnReservar) {
                btnReservar.addEventListener('click', () => {
                    const url = voo.bookingUrl || 'https://www.decolar.com/';
                    window.open(url, '_blank');
                });
            }
        } catch (error) {
            console.error('Erro ao adicionar evento ao botão de reserva:', error);
        }
        
        return card;
    } catch (error) {
        console.error('Erro ao criar cartão de voo:', error);
        return criarCartaoErro();
    }
}

/**
 * Cria um cartão de erro para quando não for possível exibir um voo
 * @returns {HTMLElement} - Elemento DOM do cartão de erro
 */
function criarCartaoErro() {
    const card = document.createElement('div');
    card.className = 'flight-card error-card';
    card.textContent = 'Não foi possível exibir este voo. Por favor, tente novamente mais tarde.';
    return card;
}

/**
 * Exibe um erro na busca de voos
 * @param {string} mensagem - Mensagem de erro
 * @param {HTMLElement} container - Container para exibir o erro
 */
export function exibirErro(mensagem, container) {
    if (!container) {
        container = document.getElementById('resultados');
        if (!container) return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Criar elemento de erro
    const erro = document.createElement('div');
    erro.className = 'error';
    erro.textContent = mensagem;
    
    // Adicionar ao container
    container.appendChild(erro);
}

function redirectToAirline(link, voo) {
    // Usar a URL armazenada pela função getLinkReserva, se disponível
    const urlToUse = window.lastRedirectUrl || link;
    console.log('URL para redirecionamento:', urlToUse);

    // Simplificando - em vez de mostrar overlay complexo, apenas criar um botão clicável
    const overlay = document.createElement('div');
    overlay.className = 'redirect-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Conteúdo mais simples
    const conteudo = document.createElement('div');
    conteudo.style.backgroundColor = '#fff';
    conteudo.style.padding = '30px';
    conteudo.style.borderRadius = '8px';
    conteudo.style.maxWidth = '500px';
    conteudo.style.textAlign = 'center';

    // Título
    const titulo = document.createElement('h3');
    titulo.textContent = `Reservar voo da ${voo.companhia}`;
    titulo.style.marginBottom = '20px';
    conteudo.appendChild(titulo);

    // Informações
    const info = document.createElement('p');
    info.textContent = `Você será redirecionado para o site da companhia aérea para completar sua reserva de ${voo.origem} para ${voo.destino}.`;
    info.style.marginBottom = '20px';
    conteudo.appendChild(info);

    // Opções de redirecionamento
    const opcoes = document.createElement('div');
    opcoes.style.display = 'flex';
    opcoes.style.flexDirection = 'column';
    opcoes.style.gap = '10px';

    // Botão 1: Abrir em nova aba
    const btnNovaAba = document.createElement('a');
    btnNovaAba.href = urlToUse;
    btnNovaAba.target = '_blank';
    btnNovaAba.rel = 'noopener noreferrer';
    btnNovaAba.textContent = 'Abrir em nova aba';
    btnNovaAba.style.padding = '12px 20px';
    btnNovaAba.style.backgroundColor = '#0066cc';
    btnNovaAba.style.color = '#fff';
    btnNovaAba.style.textDecoration = 'none';
    btnNovaAba.style.borderRadius = '4px';
    btnNovaAba.style.fontWeight = 'bold';
    opcoes.appendChild(btnNovaAba);

    // Botão 2: Abrir na mesma aba
    const btnMesmaAba = document.createElement('a');
    btnMesmaAba.href = urlToUse;
    btnMesmaAba.textContent = 'Abrir na mesma aba';
    btnMesmaAba.style.padding = '12px 20px';
    btnMesmaAba.style.backgroundColor = '#4CAF50';
    btnMesmaAba.style.color = '#fff';
    btnMesmaAba.style.textDecoration = 'none';
    btnMesmaAba.style.borderRadius = '4px';
    btnMesmaAba.style.fontWeight = 'bold';
    opcoes.appendChild(btnMesmaAba);

    // Botão 3: Cancelar
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.padding = '12px 20px';
    btnCancelar.style.backgroundColor = '#f44336';
    btnCancelar.style.color = '#fff';
    btnCancelar.style.border = 'none';
    btnCancelar.style.borderRadius = '4px';
    btnCancelar.style.cursor = 'pointer';
    btnCancelar.style.fontWeight = 'bold';
    btnCancelar.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    opcoes.appendChild(btnCancelar);

    conteudo.appendChild(opcoes);
    overlay.appendChild(conteudo);
    document.body.appendChild(overlay);
}

/**
 * Retorna o URL para o logotipo da companhia aérea
 * @param {string} companhia - Nome da companhia aérea
 * @returns {string} URL para o logotipo
 */
export function getAirlineLogo(companhia) {
    console.log('getAirlineLogo chamado com:', companhia, 'tipo:', typeof companhia);

    // Se companhia for undefined ou null, retorna imagem padrão
    if (!companhia) {
        console.log('Companhia não definida, usando imagem padrão');
        return 'images/default-airline.png';
    }

    // Normaliza a companhia para busca
    const companhiaNormalizada = String(companhia).trim();

    // Define caminhos diretamente para cada companhia
    const logotipos = {
        // Companhias principais por nome
        'LATAM': 'latam.png',
        'GOL': 'gol.png',
        'Azul': 'azul.png',
        'American Airlines': 'american.png',
        'Delta': 'delta.png',
        'Copa Airlines': 'copa.png',
        'TAP': 'tap.png',
        'United': 'united.png',
        'Avianca': 'avianca.png',
        'Emirates': 'emirates.png',
        'Q4': 'q4.png',

        // Códigos IATA
        'LA': 'latam.png',
        'G3': 'gol.png',
        'AD': 'azul.png',
        'AA': 'american.png',
        'DL': 'delta.png',
        'CM': 'copa.png',
        'TP': 'tap.png',
        'UA': 'united.png',
        'AV': 'avianca.png',
        'EK': 'emirates.png'
    };

    let nomeArquivo = '';

    // Verifica se temos um caminho para esta companhia
    if (logotipos[companhiaNormalizada]) {
        nomeArquivo = logotipos[companhiaNormalizada];
        console.log(`Encontrado logotipo para ${companhiaNormalizada}:`, nomeArquivo);
    } else {
        console.log(`Usando imagem padrão para companhia: ${companhiaNormalizada}`);
        console.log('Companhias disponíveis:', Object.keys(logotipos).join(', '));
        nomeArquivo = 'default-airline.png';
    }

    // Tenta usar chrome.runtime.getURL se disponível (ambiente de extensão)
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            // Primeiro tenta na pasta airlines
            const caminho = `images/airlines/${nomeArquivo}`;
            console.log('Usando caminho de extensão:', caminho);
            return chrome.runtime.getURL(caminho);
        }
    } catch (e) {
        console.error('Erro ao usar chrome.runtime.getURL:', e);
    }

    // Opções de caminhos para tentar
    const possiveisCaminhos = [
        `images/airlines/${nomeArquivo}`, // Relativo à raiz
        `/images/airlines/${nomeArquivo}`, // Absoluto
        `./images/airlines/${nomeArquivo}`, // Relativo ao diretório atual
        `../images/airlines/${nomeArquivo}`, // Um nível acima
        nomeArquivo === 'default-airline.png' ? 'images/default-airline.png' : `images/airlines/${nomeArquivo}`
    ];

    console.log('Usando primeiro caminho disponível:', possiveisCaminhos[0]);
    return possiveisCaminhos[0];
}