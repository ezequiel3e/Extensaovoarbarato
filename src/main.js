import { searchFlights } from '../services/flightService.js';
import { encontrarAeroporto } from './data/aeroportos.js';
import { mostrarSugestoes } from './utils/sugestoes.js';
import { criarCartaoVoo } from './utils/flightDisplay.js';

document.addEventListener('DOMContentLoaded', () => {
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
    inputData.value = hoje;

    function mostrarErro(mensagem) {
        errorDiv.textContent = mensagem;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    async function buscarVoos() {
        errorDiv.style.display = 'none';
        resultadosDiv.innerHTML = '';

        const origemAeroporto = encontrarAeroporto(inputOrigem.value);
        const destinoAeroporto = encontrarAeroporto(inputDestino.value);
        const data = inputData.value;

        if (!origemAeroporto) {
            mostrarErro('Por favor, selecione um aeroporto de origem válido da lista');
            return;
        }

        if (!destinoAeroporto) {
            mostrarErro('Por favor, selecione um aeroporto de destino válido da lista');
            return;
        }

        if (!data) {
            mostrarErro('Por favor, selecione uma data para a viagem');
            return;
        }

        if (origemAeroporto.codigo === destinoAeroporto.codigo) {
            mostrarErro('Origem e destino não podem ser iguais');
            return;
        }

        loadingDiv.style.display = 'block';

        try {
            const voos = await searchFlights({
                origem: origemAeroporto.codigo,
                destino: destinoAeroporto.codigo,
                data: data
            });

            loadingDiv.style.display = 'none';

            if (!voos || voos.length === 0) {
                resultadosDiv.innerHTML = '<div class="no-results">Nenhum voo encontrado para esta rota e data.</div>';
                return;
            }

            resultadosDiv.innerHTML = '';
            voos.forEach(voo => {
                const card = criarCartaoVoo(voo);
                resultadosDiv.appendChild(card);
            });
        } catch (erro) {
            loadingDiv.style.display = 'none';
            mostrarErro(`Erro ao buscar voos: ${erro.message}`);
            console.error('Erro na busca:', erro);
        }
    }

    inputOrigem.addEventListener('input', (e) => {
        mostrarSugestoes(inputOrigem, sugestoesOrigem, e.target.value);
    });

    inputDestino.addEventListener('input', (e) => {
        mostrarSugestoes(inputDestino, sugestoesDestino, e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!sugestoesOrigem.contains(e.target) && e.target !== inputOrigem) {
            sugestoesOrigem.style.display = 'none';
        }
        if (!sugestoesDestino.contains(e.target) && e.target !== inputDestino) {
            sugestoesDestino.style.display = 'none';
        }
    });

    btnBuscar.addEventListener('click', buscarVoos);
});