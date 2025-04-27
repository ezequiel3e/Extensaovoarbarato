export const aeroportos = [
    // São Paulo
    { codigo: 'GRU', nome: 'São Paulo - Guarulhos', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'CGH', nome: 'São Paulo - Congonhas', cidade: 'São Paulo', estado: 'SP' },
    { codigo: 'VCP', nome: 'Campinas - Viracopos', cidade: 'Campinas', estado: 'SP' },
    // Capitais
    { codigo: 'BSB', nome: 'Brasília Internacional', cidade: 'Brasília', estado: 'DF' },
    { codigo: 'GIG', nome: 'Rio de Janeiro - Galeão', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'SDU', nome: 'Rio de Janeiro - Santos Dumont', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { codigo: 'CNF', nome: 'Belo Horizonte - Confins', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'PLU', nome: 'Belo Horizonte - Pampulha', cidade: 'Belo Horizonte', estado: 'MG' },
    { codigo: 'POA', nome: 'Porto Alegre - Salgado Filho', cidade: 'Porto Alegre', estado: 'RS' },
    { codigo: 'REC', nome: 'Recife - Guararapes', cidade: 'Recife', estado: 'PE' },
    { codigo: 'SSA', nome: 'Salvador - Luis E. Magalhães', cidade: 'Salvador', estado: 'BA' },
    { codigo: 'FOR', nome: 'Fortaleza - Pinto Martins', cidade: 'Fortaleza', estado: 'CE' },
    { codigo: 'SLZ', nome: 'São Luís - Marechal Cunha Machado', cidade: 'São Luís', estado: 'MA' },
    { codigo: 'NAT', nome: 'Natal - Augusto Severo', cidade: 'Natal', estado: 'RN' },
    { codigo: 'MCZ', nome: 'Maceió - Zumbi dos Palmares', cidade: 'Maceió', estado: 'AL' },
    { codigo: 'JPA', nome: 'João Pessoa - Castro Pinto', cidade: 'João Pessoa', estado: 'PB' },
    { codigo: 'AJU', nome: 'Aracaju - Santa Maria', cidade: 'Aracaju', estado: 'SE' },
    { codigo: 'THE', nome: 'Teresina - Senador Petrônio Portella', cidade: 'Teresina', estado: 'PI' },
    { codigo: 'CGR', nome: 'Campo Grande', cidade: 'Campo Grande', estado: 'MS' },
    { codigo: 'CGB', nome: 'Cuiabá - Marechal Rondon', cidade: 'Cuiabá', estado: 'MT' },
    { codigo: 'GYN', nome: 'Goiânia - Santa Genoveva', cidade: 'Goiânia', estado: 'GO' },
    { codigo: 'FLN', nome: 'Florianópolis - Hercílio Luz', cidade: 'Florianópolis', estado: 'SC' },
    { codigo: 'CWB', nome: 'Curitiba - Afonso Pena', cidade: 'Curitiba', estado: 'PR' },
    { codigo: 'BEL', nome: 'Belém - Val de Cans', cidade: 'Belém', estado: 'PA' },
    { codigo: 'MAO', nome: 'Manaus - Eduardo Gomes', cidade: 'Manaus', estado: 'AM' },
    { codigo: 'PMW', nome: 'Palmas', cidade: 'Palmas', estado: 'TO' },
    { codigo: 'PVH', nome: 'Porto Velho', cidade: 'Porto Velho', estado: 'RO' },
    { codigo: 'RBR', nome: 'Rio Branco', cidade: 'Rio Branco', estado: 'AC' },
    { codigo: 'BVB', nome: 'Boa Vista', cidade: 'Boa Vista', estado: 'RR' },
    { codigo: 'MCP', nome: 'Macapá', cidade: 'Macapá', estado: 'AP' },
    { codigo: 'VIX', nome: 'Vitória - Eurico Salles', cidade: 'Vitória', estado: 'ES' },
    // Destinos populares não capitais
    { codigo: 'IGU', nome: 'Foz do Iguaçu', cidade: 'Foz do Iguaçu', estado: 'PR' },
    { codigo: 'LDB', nome: 'Londrina', cidade: 'Londrina', estado: 'PR' },
    { codigo: 'JOI', nome: 'Joinville', cidade: 'Joinville', estado: 'SC' }
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