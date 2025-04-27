function mostrarAvisoSistema(mensagem, tipo = 'info', duracao = 3000) {
    const avisoElement = document.getElementById('aviso-resultados-salvos');
    avisoElement.textContent = mensagem;
    avisoElement.className = `aviso-sistema ${tipo}`;
    avisoElement.style.display = 'block';

    setTimeout(() => {
        avisoElement.style.display = 'none';
    }, duracao);
}

function salvarResultados() {
    // ... existing code ...
    localStorage.setItem('resultadosSalvos', JSON.stringify(resultadosSalvos));
    mostrarAvisoSistema('Resultados salvos com sucesso!', 'info');
}

// ... existing code ...