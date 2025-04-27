// Script para limpar o cache do navegador

// Esta função será chamada quando o navegador carregar esta página
function limparCache() {
    // Se estamos em um contexto de extensão do navegador
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.reload) {
        console.log('Limpando cache da extensão...');

        // Remove todos os dados de armazenamento local
        if (localStorage) {
            localStorage.clear();
            console.log('LocalStorage limpo');
        }

        // Remove todos os dados de session storage
        if (sessionStorage) {
            sessionStorage.clear();
            console.log('SessionStorage limpo');
        }

        // Informa ao usuário
        alert('Cache limpo com sucesso. A extensão será recarregada.');

        // Recarrega a extensão
        chrome.runtime.reload();
    } else {
        // Se estamos em um contexto de página web normal
        console.log('Limpando cache da página...');

        // Remove todos os dados de armazenamento local
        if (localStorage) {
            localStorage.clear();
            console.log('LocalStorage limpo');
        }

        // Remove todos os dados de session storage
        if (sessionStorage) {
            sessionStorage.clear();
            console.log('SessionStorage limpo');
        }

        // Força o navegador a recarregar sem usar o cache
        alert('Cache limpo com sucesso. A página será recarregada.');
        window.location.reload(true);
    }
}

// Se este script for incluído em uma página, executará automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', limparCache);
} else {
    limparCache();
}