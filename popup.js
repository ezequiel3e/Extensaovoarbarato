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
        const voos = await searchFlights(origem, destino, data);

        if (!voos || voos.length === 0) {
            mostrarErro('Nenhum voo encontrado para esta rota e data.');
            return;
        }

        const containerResultados = document.getElementById('resultados');
        containerResultados.innerHTML = '';

        voos.forEach(voo => {
            const cartao = criarCartaoVoo({
                companhia: voo.companhia,
                horarioPartida: formatarHorario(voo.horarioPartida),
                horarioChegada: formatarHorario(voo.horarioChegada),
                preco: formatarPreco(voo.preco),
                duracao: voo.duracao
            });
            containerResultados.appendChild(cartao);
        });

        containerResultados.style.display = 'block';
        document.getElementById('loading').style.display = 'none';
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
    const cartao = document.createElement('div');
    cartao.className = 'cartao-voo';

    cartao.innerHTML = `
        <div class="info-voo">
            <div class="companhia">${voo.companhia}</div>
            <div class="horarios">
                <span class="horario-partida">${voo.horarioPartida}</span>
                <span class="separador">→</span>
                <span class="horario-chegada">${voo.horarioChegada}</span>
            </div>
            <div class="duracao">${voo.duracao}</div>
        </div>
        <div class="preco">${voo.preco}</div>
    `;

    return cartao;
}