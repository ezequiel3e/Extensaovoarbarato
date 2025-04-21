import { buscarSugestoes } from '../data/aeroportos.js';

export function criarListaSugestoes(input) {
    const container = document.createElement('div');
    container.className = 'sugestoes-container';
    container.style.display = 'none';
    input.parentNode.appendChild(container);
    return container;
}

export function mostrarSugestoes(input, container, valor) {
    container.innerHTML = '';
    if (!valor || valor.length < 2) {
        container.style.display = 'none';
        return;
    }

    const sugestoes = buscarSugestoes(valor);

    if (sugestoes.length > 0) {
        container.style.display = 'block';

        // Agrupa aeroportos por cidade
        const aeroportosPorCidade = sugestoes.reduce((acc, aeroporto) => {
            if (!acc[aeroporto.cidade]) {
                acc[aeroporto.cidade] = [];
            }
            acc[aeroporto.cidade].push(aeroporto);
            return acc;
        }, {});

        // Para cada cidade, cria uma sugestão
        Object.entries(aeroportosPorCidade).forEach(([cidade, aeroportos]) => {
                    const div = document.createElement('div');
                    div.className = 'sugestao';

                    // Se a cidade tem mais de um aeroporto, mostra todos
                    if (aeroportos.length > 1) {
                        div.innerHTML = `
                    <div class="sugestao-principal">${cidade} - ${aeroportos[0].estado}</div>
                    <div class="sugestao-secundaria">
                        ${aeroportos.map(a => `${a.nome} (${a.codigo})`).join('<br>')}
                    </div>
                `;
                
                // Cria um clique para cada aeroporto
                aeroportos.forEach(aeroporto => {
                    const subDiv = document.createElement('div');
                    subDiv.className = 'sugestao-item';
                    subDiv.textContent = `${aeroporto.nome} (${aeroporto.codigo})`;
                    subDiv.addEventListener('click', () => {
                        input.value = `${cidade} - ${aeroporto.nome}`;
                        input.dataset.codigo = aeroporto.codigo;
                        container.style.display = 'none';
                    });
                    div.appendChild(subDiv);
                });
            } else {
                // Se a cidade tem apenas um aeroporto
                const aeroporto = aeroportos[0];
                div.innerHTML = `
                    <div class="sugestao-principal">${cidade} - ${aeroporto.estado}</div>
                    <div class="sugestao-secundaria">${aeroporto.nome} (${aeroporto.codigo})</div>
                `;
                div.addEventListener('click', () => {
                    input.value = `${cidade} - ${aeroporto.nome}`;
                    input.dataset.codigo = aeroporto.codigo;
                    container.style.display = 'none';
                });
            }

            container.appendChild(div);
        });
    } else {
        container.style.display = 'none';
    }
}