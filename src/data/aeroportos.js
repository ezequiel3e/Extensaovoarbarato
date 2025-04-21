export const aeroportos = [
    { codigo: 'VCP', nome: 'Campinas - Viracopos', cidade: 'Campinas', estado: 'SP' },
    { codigo: 'GRU', nome: 'São Paulo - Guarulhos', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'CGH', nome: 'São Paulo - Congonhas', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'BSB', nome: 'Brasília Internacional', cidade: 'Brasília', estado: 'DF' },
    { codigo: 'GIG', nome: 'Rio de Janeiro - Galeão', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'SDU', nome: 'Rio de Janeiro - Santos Dumont', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'CNF', nome: 'Belo Horizonte - Confins', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'POA', nome: 'Porto Alegre - Salgado Filho', cidade: 'Porto Alegre', estado: 'RS' },
    { codigo: 'REC', nome: 'Recife - Guararapes', cidade: 'Recife', estado: 'PE' },
    { codigo: 'SSA', nome: 'Salvador - Luis E. Magalhães', cidade: 'Salvador', estado: 'BA' }
];

// Função para normalizar texto (remover acentos e converter para minúsculas)
function normalizarTexto(texto) {
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

export function encontrarAeroporto(texto) {
    if (!texto) return null;

    const termoBusca = normalizarTexto(texto);

    // Primeiro, tenta encontrar pela cidade exata
    const porCidadeExata = aeroportos.find(aeroporto =>
        normalizarTexto(aeroporto.cidade) === termoBusca
    );
    if (porCidadeExata) return porCidadeExata;

    // Depois, tenta encontrar pelo código exato
    const porCodigo = aeroportos.find(aeroporto =>
        normalizarTexto(aeroporto.codigo) === termoBusca
    );
    if (porCodigo) return porCodigo;

    // Por fim, busca por correspondência parcial
    return aeroportos.find(aeroporto =>
        normalizarTexto(aeroporto.cidade).includes(termoBusca) ||
        normalizarTexto(aeroporto.nome).includes(termoBusca) ||
        normalizarTexto(aeroporto.codigo).includes(termoBusca)
    );
}

export function buscarSugestoes(texto) {
    if (!texto || texto.length < 2) return [];

    const termoBusca = normalizarTexto(texto);

    return aeroportos.filter(aeroporto => {
        const cidadeNormalizada = normalizarTexto(aeroporto.cidade);
        const nomeNormalizado = normalizarTexto(aeroporto.nome);
        const codigoNormalizado = normalizarTexto(aeroporto.codigo);

        return cidadeNormalizada.includes(termoBusca) ||
            nomeNormalizado.includes(termoBusca) ||
            codigoNormalizado.includes(termoBusca);
    });
}