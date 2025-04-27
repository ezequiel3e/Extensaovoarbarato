// Arquivo: contexto.js
// Descrição: Script para gerenciar a página de contexto da viagem

// A função já é chamada diretamente do script em linha com nonce
export function carregarDadosContexto() {
    try {
        const containerDetalhes = document.getElementById('contexto-detalhes');
        if (!containerDetalhes) {
            console.error('Elemento contexto-detalhes não encontrado');
            return;
        }

        // Dados de exemplo para demonstração
        const dadosContexto = {
            titulo: 'Informações do Contexto',
            descricao: 'Detalhes adicionais sobre sua viagem'
        };

        // Criar elementos do DOM de forma programática em vez de usar template strings
        const divInfo = document.createElement('div');
        divInfo.className = 'contexto-info';

        const titulo = document.createElement('h3');
        titulo.textContent = dadosContexto.titulo;

        const descricao = document.createElement('p');
        descricao.textContent = dadosContexto.descricao;

        divInfo.appendChild(titulo);
        divInfo.appendChild(descricao);

        // Limpar e adicionar o novo conteúdo
        containerDetalhes.innerHTML = '';
        containerDetalhes.appendChild(divInfo);

        console.log('Dados de contexto carregados com sucesso');
    } catch (erro) {
        console.error('Erro ao carregar dados de contexto:', erro);
    }
}

// Chamar a função quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', carregarDadosContexto);