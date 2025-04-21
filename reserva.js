document.addEventListener('DOMContentLoaded', () => {
    const resumoVooDetalhes = document.getElementById('resumo-voo-detalhes');
    const formReserva = document.getElementById('form-reserva');

    // Obter parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const origem = params.get('origem');
    const destino = params.get('destino');
    const data = params.get('data');
    const companhia = params.get('companhia');
    const preco = params.get('preco');

    // Log para debugging
    console.log('Parâmetros recebidos:', { origem, destino, data, companhia, preco });

    // Verificar se todos os parâmetros necessários estão presentes
    const parametrosValidos = origem && destino && data && companhia && preco;
    console.log('Parâmetros válidos:', parametrosValidos);

    if (!parametrosValidos) {
        resumoVooDetalhes.innerHTML = '<p>Dados do voo não encontrados ou incompletos. <a href="index.html">Voltar para a busca</a></p>';
        formReserva.style.display = 'none';
        return;
    }

    // Formatar data para exibição
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Criar elementos para o resumo do voo
    const criarInfoItem = (label, value) => {
        const div = document.createElement('div');
        div.className = 'info-item';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'info-label';
        labelSpan.textContent = label;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'info-value';
        valueSpan.textContent = value;

        div.appendChild(labelSpan);
        div.appendChild(valueSpan);

        return div;
    };

    const fragmento = document.createDocumentFragment();
    fragmento.appendChild(criarInfoItem('Companhia:', companhia));
    fragmento.appendChild(criarInfoItem('Origem:', origem));
    fragmento.appendChild(criarInfoItem('Destino:', destino));
    fragmento.appendChild(criarInfoItem('Data:', dataFormatada));
    fragmento.appendChild(criarInfoItem('Valor:', `R$ ${parseFloat(preco).toFixed(2)}`));

    resumoVooDetalhes.appendChild(fragmento);

    // Processar a reserva
    formReserva.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const documento = document.getElementById('documento').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const formaPagamento = document.getElementById('forma-pagamento').value;

        if (!nome || !documento || !email || !telefone || !formaPagamento) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Aqui você poderia enviar os dados para um servidor
        // Simulando confirmação de reserva
        alert(`Reserva confirmada!\n\nPassageiro: ${nome}\nVoo: ${companhia} - ${origem} para ${destino}\nData: ${dataFormatada}\nValor: R$ ${parseFloat(preco).toFixed(2)}`);

        // Redirecionar para a página inicial
        window.location.href = 'index.html';
    });
});