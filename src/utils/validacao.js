/**
 * Utilitário para validação de campos do formulário de busca
 */

// Lista de códigos IATA comuns no Brasil
export const CODIGOS_IATA_BR = {
    'GRU': 'São Paulo - Guarulhos',
    'CGH': 'São Paulo - Congonhas',
    'VCP': 'Campinas - Viracopos',
    'GIG': 'Rio de Janeiro - Galeão',
    'SDU': 'Rio de Janeiro - Santos Dumont',
    'BSB': 'Brasília',
    'CNF': 'Belo Horizonte - Confins',
    'SSA': 'Salvador',
    'REC': 'Recife',
    'FOR': 'Fortaleza',
    'CWB': 'Curitiba',
    'POA': 'Porto Alegre',
    'FLN': 'Florianópolis',
    'NAT': 'Natal',
    'BEL': 'Belém',
    'MAO': 'Manaus',
    'VIX': 'Vitória',
    'MCZ': 'Maceió',
    'IGU': 'Foz do Iguaçu',
    'AJU': 'Aracaju',
    'JPA': 'João Pessoa',
    'THE': 'Teresina',
    'SLZ': 'São Luís',
    'CGB': 'Cuiabá',
    'CGR': 'Campo Grande',
    'GYN': 'Goiânia',
    'PMW': 'Palmas',
    'PVH': 'Porto Velho',
    'RBR': 'Rio Branco',
    'BVB': 'Boa Vista',
    'MCP': 'Macapá'
};

/**
 * Verifica se um código IATA é válido
 * @param {string} codigo - Código IATA a ser validado
 * @returns {boolean} - Verdadeiro se for um código IATA válido
 */
export function validarCodigoIATA(codigo) {
    if (!codigo) return false;

    // Verifica se é um código IATA válido (3 letras maiúsculas)
    const regexIATA = /^[A-Z]{3}$/;
    return regexIATA.test(codigo);
}

/**
 * Extrai o código IATA de um texto
 * @param {string} texto - Texto que pode conter um código IATA
 * @returns {string|null} - Código IATA ou null se não encontrado
 */
export function extrairCodigoIATA(texto) {
    if (!texto) return null;

    // Tenta extrair um código IATA que está no final do texto após um traço
    const match = texto.match(/\s-\s([A-Z]{3})$/);
    if (match) return match[1];

    // Tenta extrair qualquer código IATA de 3 letras maiúsculas
    const directMatch = texto.toUpperCase().match(/\b([A-Z]{3})\b/);
    return directMatch ? directMatch[1] : null;
}

/**
 * Valida os parâmetros de busca de voos
 * @param {Object} params - Parâmetros de busca
 * @returns {Object} - Objeto com propriedades isValid e message
 */
export function validarParametrosBusca(params) {
    const { origem, destino, data } = params;

    if (!origem) {
        return {
            isValid: false,
            message: 'Por favor, informe um aeroporto de origem válido.'
        };
    }

    if (!destino) {
        return {
            isValid: false,
            message: 'Por favor, informe um aeroporto de destino válido.'
        };
    }

    if (origem === destino) {
        return {
            isValid: false,
            message: 'O aeroporto de origem e destino não podem ser iguais.'
        };
    }

    if (!data) {
        return {
            isValid: false,
            message: 'Por favor, selecione uma data para a viagem.'
        };
    }

    return { isValid: true };
}

/**
 * Normaliza um parâmetro de busca para garantir que seja um código IATA válido
 * @param {string} valor - Valor a ser normalizado
 * @returns {string|null} - Código IATA ou null se inválido
 */
export function normalizarParametroBusca(valor) {
    if (!valor) return null;

    // Se o valor já for um código IATA válido, retorna-o
    if (validarCodigoIATA(valor)) return valor;

    // Tenta extrair o código IATA do texto
    const codigoExtraido = extrairCodigoIATA(valor);

    // Verifica se o código extraído é válido
    if (codigoExtraido && validarCodigoIATA(codigoExtraido)) {
        return codigoExtraido;
    }

    return null;
}

/**
 * Obtém o nome completo de um aeroporto a partir do código IATA
 * @param {string} codigo - Código IATA do aeroporto
 * @returns {string} - Nome completo do aeroporto ou o próprio código se não encontrado
 */
export function obterNomeAeroporto(codigo) {
    if (!codigo) return '';

    return CODIGOS_IATA_BR[codigo] ? `${CODIGOS_IATA_BR[codigo]} - ${codigo}` : codigo;
}