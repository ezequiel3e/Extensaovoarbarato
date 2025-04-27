// Declarando as variáveis globais
let inputOrigem, inputDestino, inputData;

// Inicializa os elementos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa as referências dos inputs
    inputOrigem = document.getElementById('inputOrigem');
    inputDestino = document.getElementById('inputDestino');
    inputData = document.getElementById('inputData');

    // Adiciona o listener no botão de busca
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarVoos);
    }

    // Previne a submissão do formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            buscarVoos();
        });
    }
});

async function buscarVoos() {
    const origem = extrairCodigoAeroporto(inputOrigem.value);
    const destino = extrairCodigoAeroporto(inputDestino.value);
    const data = inputData.value;

    if (!origem || !destino || !data) {
        mostrarErro('Por favor, preencha todos os campos corretamente.');
        return;
    }

    try {
        mostrarCarregando();

        // Limpar resultados anteriores
        const containerResultados = document.getElementById('resultados');
        containerResultados.innerHTML = '';

        // Criar um Set para controlar voos já exibidos
        const voosExibidos = new Set();

        const voos = await searchFlights({
            origin: origem,
            destination: destino,
            date: data
        });

        if (!voos || !voos.results || voos.results.length === 0) {
            mostrarErro('Nenhum voo encontrado para esta rota e data.');
            return;
        }

        // Ordenar voos por preço
        const voosOrdenados = voos.results.sort((a, b) => {
            const precoA = a.precoComDesconto || a.preco;
            const precoB = b.precoComDesconto || b.preco;
            return precoA - precoB;
        });

        // Marcar o voo mais barato
        if (voosOrdenados.length > 0) {
            voosOrdenados[0].isBestPrice = true;
        }

        // Adicionar os voos diretamente ao container
        voosOrdenados.forEach(voo => {
            // Criar um identificador único para o voo
            const vooId = `${voo.airlineCode}-${voo.horarioPartida}-${voo.preco}`;

            if (!voosExibidos.has(vooId)) {
                const cartao = criarCartaoVoo(voo);
                if (cartao) {
                    voosExibidos.add(vooId);
                    containerResultados.appendChild(cartao);
                }
            }
        });

        containerResultados.style.display = 'block';
        document.getElementById('loading').style.display = 'none';

        // Atualizar a mensagem de última busca
        const mensagemBusca = document.querySelector('.ultima-busca');
        if (mensagemBusca) {
            mensagemBusca.textContent = `Mostrando resultados da última busca realizada há 0 hora(s).`;
        }

    } catch (error) {
        console.error('Erro ao buscar voos:', error);
        mostrarErro(error.message || 'Ocorreu um erro ao buscar os voos. Tente novamente mais tarde.');
    }
}

function formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(preco);
}

function formatarHorario(data) {
    return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function extrairCodigoAeroporto(texto) {
    if (!texto) return null;

    // Verifica se há um código IATA (3 letras maiúsculas) entre parênteses
    const matchParenteses = texto.match(/\(([A-Z]{3})\)/);
    if (matchParenteses) return matchParenteses[1];

    // Verifica se há um código IATA no final do texto após um hífen
    // Exemplo: "Campinas - VCP" -> retorna "VCP"
    const matchHifen = texto.match(/- ([A-Z]{3})$/);
    if (matchHifen) return matchHifen[1];

    // Verifica se o texto é exatamente um código IATA
    const matchCodigo = texto.match(/^[A-Z]{3}$/);
    if (matchCodigo) return texto;

    return null;
}

function mostrarErro(mensagem) {
    const containerResultados = document.getElementById('resultados');
    containerResultados.innerHTML = '';
    containerResultados.style.display = 'none';

    const loading = document.getElementById('loading');
    loading.style.display = 'none';

    const erro = document.getElementById('erro');
    erro.textContent = mensagem;
    erro.style.display = 'block';
}

function mostrarCarregando() {
    const containerResultados = document.getElementById('resultados');
    containerResultados.innerHTML = '';

    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const erro = document.getElementById('erro');
    erro.style.display = 'none';
}

function criarCartaoVoo(voo) {
    if (!voo) {
        console.error('Dados do voo inválidos');
        return null;
    }

    // Criar um identificador único para o voo
    const vooId = `${voo.airlineCode}-${voo.horarioPartida}-${voo.preco}`;

    // Verificar se o cartão já existe
    if (document.querySelector(`[data-voo-id="${vooId}"]`)) {
        return null;
    }

    const cartao = document.createElement('div');
    cartao.className = 'cartao-voo';
    cartao.setAttribute('data-voo-id', vooId);

    // Adicionar classe especial se for o melhor preço
    if (voo.isBestPrice) {
        cartao.classList.add('melhor-preco');
    }

    // Formatar informações de conexão
    let infoConexao = '';
    if (voo.escalas > 0 && Array.isArray(voo.conexoes) && voo.conexoes.length > 0) {
        infoConexao = `
            <div class="info-conexao">
                <span class="escalas">${voo.escalas} ${voo.escalas === 1 ? 'conexão' : 'conexões'}</span>
                ${voo.conexoes.map(conexao => `
                    <div class="conexao-detalhe">
                        <span class="aeroporto">${conexao.aeroporto}</span>
                        <span class="tempo-espera">Espera: ${conexao.tempoEspera}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Formatar preço com desconto se disponível
    const precoFormatado = voo.precoComDesconto ? 
        `<div class="preco-original">${formatarPreco(voo.preco)}</div>
         <div class="preco-desconto">${formatarPreco(voo.precoComDesconto)}</div>` :
        `<div class="preco">${formatarPreco(voo.preco)}</div>`;

    // Garantir que temos um código de companhia aérea válido
    const airlineCode = voo.airlineCode ? voo.airlineCode.toLowerCase() : 'default';

    // Preparar dados do voo para o botão
    const flightData = {
        origem: voo.origem,
        destino: voo.destino,
        data: voo.data || voo.departureDate,
        horarioPartida: voo.horarioPartida,
        preco: voo.precoComDesconto || voo.preco
    };

    cartao.innerHTML = `
        <div class="info-voo">
            <div class="companhia">
                <img src="assets/airlines/${airlineCode}.png" alt="${voo.companhia}" onerror="this.src='assets/airlines/default.png'"/>
                <span>${voo.companhia}</span>
            </div>
            <div class="horarios">
                <div class="horario-grupo">
                    <span class="horario-partida">${voo.horarioPartida || '--:--'}</span>
                    <span class="aeroporto">${voo.origem || ''}</span>
                </div>
                <div class="duracao">
                    <span class="linha-duracao">━━━━━━</span>
                    <span class="tempo-duracao">${voo.duracao || '--:--'}</span>
                </div>
                <div class="horario-grupo">
                    <span class="horario-chegada">${voo.horarioChegada || '--:--'}</span>
                    <span class="aeroporto">${voo.destino || ''}</span>
                </div>
            </div>
            ${infoConexao}
        </div>
        <div class="preco-container">
            ${precoFormatado}
            ${voo.discountPercent ? `<div class="desconto-tag">-${voo.discountPercent}%</div>` : ''}
            <button class="btn-reservar" data-airline="${airlineCode}" data-flight-data='${JSON.stringify(flightData)}'>
                Reservar agora
            </button>
        </div>
    `;

    // Adicionar evento de clique no botão de reserva
    const btnReservar = cartao.querySelector('.btn-reservar');
    btnReservar.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Clique no botão de reserva');
        try {
            const flightData = JSON.parse(this.dataset.flightData);
            const airline = this.dataset.airline;
            console.log('Dados do voo para reserva:', { flightData, airline });
            redirecionarParaReserva(airline, flightData);
        } catch (error) {
            console.error('Erro ao processar dados do voo:', error);
        }
    });

    return cartao;
}

function redirecionarParaReserva(airline, flightData) {
    try {
        console.log('Iniciando redirecionamento para reserva:', { airline, flightData });
        let url;
        
        // Formatar a data para o formato correto (YYYY-MM-DD)
        const dataFormatada = flightData.data ? new Date(flightData.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        // Construir a URL com base na companhia aérea
        switch (airline.toUpperCase()) {
            case 'LA': // LATAM
                url = `https://www.latamairlines.com/br/pt/booking/flight-selection?origin=${flightData.origem}&destination=${flightData.destino}&outbound=${dataFormatada}&adults=1&children=0&infants=0&cabin=Economy`;
                break;
            case 'G3': // GOL
                url = `https://www.voegol.com.br/pt/selecao-voo?origin=${flightData.origem}&destination=${flightData.destino}&departureDate=${dataFormatada}&adults=1&children=0&infants=0`;
                break;
            case 'AD': // Azul
                url = `https://www.voeazul.com.br/selecao-voo?originAirportCode=${flightData.origem}&destinationAirportCode=${flightData.destino}&departureDate=${dataFormatada}&adults=1&children=0&infants=0`;
                break;
            default:
                // URL genérica para outras companhias
                url = `https://www.google.com/travel/flights?q=flights%20${flightData.origem}%20to%20${flightData.destino}`;
        }

        console.log('URL de redirecionamento:', url);

        // Usar chrome.tabs.create para abrir em uma nova aba
        chrome.tabs.create({ url: url }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('Erro ao abrir nova aba:', chrome.runtime.lastError);
                // Fallback para window.open
                window.open(url, '_blank');
            }
        });
    } catch (error) {
        console.error('Erro ao redirecionar:', error);
        // Fallback para window.open em caso de erro
        window.open(url, '_blank');
    }
}