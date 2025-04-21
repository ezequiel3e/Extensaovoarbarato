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

    // Sites mais genéricos e confiáveis
    const sitesCompanhias = {
        'LATAM': 'https://www.latamairlines.com/br/pt',
        'GOL': 'https://www.voegol.com.br',
        'Azul': 'https://www.voeazul.com.br',
        'American Airlines': 'https://www.aa.com.br',
        'Delta': 'https://www.delta.com/br/pt',
        'TAP': 'https://www.flytap.com/pt-br',
        'Q4': 'https://www.querogol.com.br'
    };

    // Formatar data para o padrão YYYY-MM-DD
    const dataFormatada = new Date(voo.partida).toISOString().split('T')[0];

    // Obter o site da companhia ou usar um site genérico de busca
    let siteBase = sitesCompanhias[voo.companhia];

    // Se não encontrar a companhia específica, usar o Google Flights (mais confiável)
    if (!siteBase) {
        return `https://www.google.com/travel/flights?q=${voo.origem}%20to%20${voo.destino}`;
    }

    console.log('Usando site da companhia:', siteBase);
    return siteBase;
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

export function criarCartaoVoo(voo) {
    const duracao = calcularDuracao(voo.partida, voo.chegada);

    // Criar elementos principais
    const cardDiv = document.createElement('div');
    cardDiv.className = 'flight-card';

    // Aplicar classe especial para o melhor preço
    if (voo.classificacaoPreco === 'MELHOR_PRECO') {
        cardDiv.classList.add('melhor-preco');
    } else if (voo.classificacaoPreco === 'PRECO_OTIMO') {
        cardDiv.classList.add('preco-otimo');
    }

    // Adicionar dados do voo como atributos de dados para debugging
    cardDiv.dataset.origem = voo.origem;
    cardDiv.dataset.destino = voo.destino;
    cardDiv.dataset.companhia = voo.companhia;
    cardDiv.dataset.numeroVoo = voo.numeroVoo;
    cardDiv.dataset.preco = voo.preco;
    cardDiv.dataset.classificacao = voo.classificacaoPreco || '';

    // Etiqueta de melhor oferta (se aplicável)
    if (voo.classificacaoPreco) {
        const etiqueta = document.createElement('div');
        etiqueta.className = 'etiqueta-preco';

        switch (voo.classificacaoPreco) {
            case 'MELHOR_PRECO':
                etiqueta.textContent = 'MELHOR PREÇO';
                etiqueta.classList.add('etiqueta-melhor');
                break;
            case 'PRECO_OTIMO':
                etiqueta.textContent = 'ÓTIMO PREÇO';
                etiqueta.classList.add('etiqueta-otimo');
                break;
            case 'PRECO_BOM':
                etiqueta.textContent = 'BOM PREÇO';
                etiqueta.classList.add('etiqueta-bom');
                break;
            default:
                etiqueta.style.display = 'none'; // Não mostra etiqueta para preços regulares ou altos
        }

        if (etiqueta.style.display !== 'none') {
            cardDiv.appendChild(etiqueta);
        }
    }

    // Informações da companhia aérea
    const airlineInfo = document.createElement('div');
    airlineInfo.className = 'airline-info';

    const airlineName = document.createElement('span');
    airlineName.className = 'airline-name';
    airlineName.textContent = voo.companhia;

    const flightNumber = document.createElement('span');
    flightNumber.className = 'flight-number';
    flightNumber.textContent = `Voo ${voo.numeroVoo}`;

    airlineInfo.appendChild(airlineName);
    airlineInfo.appendChild(flightNumber);

    // Informações do voo
    const flightInfo = document.createElement('div');
    flightInfo.className = 'flight-info';

    // Informações de tempo
    const timeInfo = document.createElement('div');
    timeInfo.className = 'time-info';

    // Partida
    const departure = document.createElement('div');
    departure.className = 'departure';

    const departureTime = document.createElement('div');
    departureTime.className = 'time';
    departureTime.textContent = formatarHorario(voo.partida);

    const departureAirport = document.createElement('div');
    departureAirport.className = 'airport';
    departureAirport.textContent = voo.origem;

    departure.appendChild(departureTime);
    departure.appendChild(departureAirport);

    // Duração
    const durationDiv = document.createElement('div');
    durationDiv.className = 'duration';

    const durationLine = document.createElement('div');
    durationLine.className = 'duration-line';
    durationLine.appendChild(criarSVGSeta());

    const durationTime = document.createElement('div');
    durationTime.className = 'duration-time';
    durationTime.textContent = duracao;

    durationDiv.appendChild(durationLine);
    durationDiv.appendChild(durationTime);

    // Chegada
    const arrival = document.createElement('div');
    arrival.className = 'arrival';

    const arrivalTime = document.createElement('div');
    arrivalTime.className = 'time';
    arrivalTime.textContent = formatarHorario(voo.chegada);

    const arrivalAirport = document.createElement('div');
    arrivalAirport.className = 'airport';
    arrivalAirport.textContent = voo.destino;

    arrival.appendChild(arrivalTime);
    arrival.appendChild(arrivalAirport);

    timeInfo.appendChild(departure);
    timeInfo.appendChild(durationDiv);
    timeInfo.appendChild(arrival);

    // Informações de preço
    const priceInfo = document.createElement('div');
    priceInfo.className = 'price-info';

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = `R$ ${voo.preco.toFixed(2)}`;

    // Adicionar classe especial para preço
    if (voo.classificacaoPreco === 'MELHOR_PRECO') {
        price.classList.add('melhor-preco-valor');
    }

    const reserveButton = document.createElement('button');
    reserveButton.className = 'reserve-button';

    const buttonText = document.createElement('span');
    buttonText.textContent = 'Reservar';

    const buttonIcon = criarSVGSeta();
    buttonIcon.setAttribute('width', '16');
    buttonIcon.setAttribute('height', '16');

    reserveButton.appendChild(buttonText);
    reserveButton.appendChild(buttonIcon);

    priceInfo.appendChild(price);
    priceInfo.appendChild(reserveButton);

    // Adiciona um link alternativo invisível para o caso do botão falhar
    const linkFallback = document.createElement('a');
    linkFallback.style.display = 'none';
    linkFallback.id = `reserva-link-${Math.random().toString(36).substring(2, 9)}`;
    linkFallback.href = getLinkReserva(voo);
    linkFallback.target = '_blank';
    priceInfo.appendChild(linkFallback);

    flightInfo.appendChild(timeInfo);
    flightInfo.appendChild(priceInfo);

    cardDiv.appendChild(airlineInfo);
    cardDiv.appendChild(flightInfo);

    // Adicionar evento de clique no botão
    reserveButton.addEventListener('click', (e) => {
        e.preventDefault();
        const url = getLinkReserva(voo);
        console.log('Redirecionando para:', url);

        try {
            // Tenta abrir em uma nova aba
            const novaJanela = window.open(url, '_blank');

            // Verifica se a janela foi aberta com sucesso
            if (!novaJanela || novaJanela.closed || typeof novaJanela.closed === 'undefined') {
                console.log('Pop-up bloqueado. Tentando redirecionamento direto...');

                // Fallback 1: alerta o usuário e oferece o link
                alert(`Não foi possível abrir o site da companhia aérea em uma nova aba. Clique em OK para continuar.`);

                // Fallback 2: tenta redirecionar na mesma aba
                window.location.href = url;
            }
        } catch (error) {
            console.error('Erro ao tentar redirecionar:', error);
            alert(`Para reservar este voo, acesse: ${url}`);

            // Se ocorrer algum erro, tenta clicar no link alternativo
            linkFallback.click();
        }
    });

    return cardDiv;
}