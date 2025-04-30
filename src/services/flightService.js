import { config } from '../config.js';

console.log('flightService.js carregado!');

let requestCount = 0;
let lastRequestTime = Date.now();

// Função para sanitizar dados
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Formata uma data para o padrão YYYY-MM-DD
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada
 */
function formatDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error('Data inválida para formatação:', date);
        // Retorna a data atual como fallback
        const hoje = new Date();
        const yyyy = hoje.getFullYear();
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const dd = String(hoje.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Função para verificar e gerenciar limites de taxa de API
function checkRateLimit() {
    const now = Date.now();
    const elapsedSinceLastRequest = now - lastRequestTime;

    // Reset contador se passou mais de 1 minuto desde a última requisição
    if (elapsedSinceLastRequest > 60000) {
        requestCount = 0;
    }

    // Verificar se estamos dentro do limite de requisições (20 por minuto)
    if (requestCount >= 20) {
        const timeToWait = 60000 - elapsedSinceLastRequest;
        if (timeToWait > 0) {
            console.warn(`Limite de taxa de requisições atingido. Aguardando ${timeToWait}ms antes da próxima requisição.`);
            throw new Error('Limite de requisições à API atingido. Por favor, tente novamente em alguns segundos.');
        }
        // Reset se o tempo já passou
        requestCount = 0;
    }

    requestCount++;
    lastRequestTime = now;
}

// Função para verificar se devemos limitar as requisições
function shouldThrottleRequests() {
    // Verificar se já fizemos muitas requisições num curto período de tempo
    const now = Date.now();
    const elapsedSinceLastRequest = now - lastRequestTime;

    // Se fizemos mais de 15 requisições no último minuto, limitar
    if (requestCount > 15 && elapsedSinceLastRequest < 60000) {
        console.warn(`Muitas requisições em um curto período: ${requestCount} nos últimos ${Math.round(elapsedSinceLastRequest/1000)} segundos`);
        return true;
    }

    return false;
}

// Função para incrementar o contador de requisições
function incrementRequestCount() {
    requestCount++;
    lastRequestTime = Date.now();
    console.log(`Contador de requisições incrementado: ${requestCount}`);
}

// Mapeamento de códigos de companhias aéreas para nomes
const AIRLINE_CODE_TO_NAME = {
    'LA': 'LATAM Airlines',
    'JJ': 'LATAM Brasil',
    'G3': 'GOL Linhas Aéreas',
    'AD': 'Azul Linhas Aéreas',
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta Air Lines',
    'LH': 'Lufthansa',
    'BA': 'British Airways',
    'IB': 'Iberia',
    'AF': 'Air France',
    'KL': 'KLM',
    'AZ': 'Alitalia',
    'TP': 'TAP Portugal',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    '4M': 'LATAM Argentina',
    'LP': 'LATAM Peru',
    'CM': 'Copa Airlines'
};

// Função para obter o nome da companhia aérea
function getAirlineName(airlineCode) {
    return AIRLINE_CODE_TO_NAME[airlineCode] || `Companhia ${airlineCode}`;
}

// Lista de códigos IATA de aeroportos brasileiros comuns
const COMMON_BR_IATA_CODES = {
    'GRU': 'São Paulo - Guarulhos',
    'CGH': 'São Paulo - Congonhas',
    'VCP': 'Campinas - Viracopos',
    'SDU': 'Rio de Janeiro - Santos Dumont',
    'GIG': 'Rio de Janeiro - Galeão',
    'BSB': 'Brasília',
    'CNF': 'Belo Horizonte - Confins',
    'SSA': 'Salvador',
    'REC': 'Recife',
    'FOR': 'Fortaleza',
    'POA': 'Porto Alegre',
    'CWB': 'Curitiba',
    'BEL': 'Belém',
    'MAN': 'Manaus',
    'FLN': 'Florianópolis',
    'NAT': 'Natal',
    'MCZ': 'Maceió',
    'VIX': 'Vitória',
    'GYN': 'Goiânia',
    'CGB': 'Cuiabá',
    'SLZ': 'São Luís - Marechal Cunha Machado',
    'MAO': 'Manaus - Eduardo Gomes',
    'PMW': 'Palmas',
    'PVH': 'Porto Velho',
    'RBR': 'Rio Branco',
    'BVB': 'Boa Vista',
    'MCP': 'Macapá'
};

// Função para validar código IATA
function isValidIata(code) {
    return code && code.length === 3 && /^[A-Z]{3}$/.test(code.toUpperCase());
}

// Função para validar parâmetros de busca
function validateSearchParams(params) {
    console.log('Validando parâmetros de busca:', params);

    // Normalizar parâmetros para manter consistência
    const normalizedParams = {
        origin: (params.origin && typeof params.origin === 'string') ? params.origin.trim().toUpperCase() : (params.origem && typeof params.origem === 'string') ? params.origem.trim().toUpperCase() : '',
        destination: (params.destination && typeof params.destination === 'string') ? params.destination.trim().toUpperCase() : (params.destino && typeof params.destino === 'string') ? params.destino.trim().toUpperCase() : '',
        date: params.date || params.data || params.departureDate,
        buscaFlexivel: params.buscaFlexivel
    };

    console.log('Parâmetros normalizados:', normalizedParams);

    // Verificar se origem e destino foram fornecidos
    if (!normalizedParams.origin || !normalizedParams.destination) {
        throw new Error('Origem e destino são obrigatórios');
    }

    // Validar formato dos códigos IATA
    if (!isValidIata(normalizedParams.origin)) {
        throw new Error(`Código IATA de origem inválido: ${normalizedParams.origin}`);
    }

    if (!isValidIata(normalizedParams.destination)) {
        throw new Error(`Código IATA de destino inválido: ${normalizedParams.destination}`);
    }

    // Validar e formatar data
    if (!normalizedParams.date) {
        throw new Error('Data de partida é obrigatória');
    }

    // Se a data for uma string, converter para objeto Date
    let parsedDate;
    if (typeof normalizedParams.date === 'string') {
        // Tentar diferentes formatos de data: YYYY-MM-DD, DD/MM/YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedParams.date)) {
            // Formato YYYY-MM-DD
            parsedDate = new Date(normalizedParams.date);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedParams.date)) {
            // Formato DD/MM/YYYY
            const parts = normalizedParams.date.split('/');
            parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            throw new Error(`Formato de data inválido: ${normalizedParams.date}. Use YYYY-MM-DD ou DD/MM/YYYY.`);
        }
    } else if (normalizedParams.date instanceof Date) {
        parsedDate = normalizedParams.date;
    } else {
        throw new Error(`Tipo de data inválido: ${typeof normalizedParams.date}`);
    }

    // Verificar se a data é válida
    if (isNaN(parsedDate.getTime())) {
        throw new Error(`Data inválida: ${normalizedParams.date}`);
    }

    // Verificar se a data não é anterior a hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
        throw new Error(`Data deve ser igual ou posterior a hoje: ${formatDate(today)}`);
    }

    // Formatar data para YYYY-MM-DD
    normalizedParams.date = formatDate(parsedDate);

    console.log('Parâmetros validados:', normalizedParams);
    return normalizedParams;
}

// Função para processar e padronizar resultados de voos
export function processFlightResults(flightResults, params = {}) {
    console.log('Processando resultados de voos');

    try {
        // Assegurar que temos dados para processar
        if (!flightResults || !flightResults.data) {
            console.error('Dados inválidos:', flightResults);
            return { success: false, message: 'Dados de voo inválidos ou vazios', voos: [] };
        }

        // Extrair dados básicos da busca
        const meta = {
            origem: params.origin || '',
            destino: params.destination || '',
            data: params.date || '',
            totalVoos: flightResults.data.length || 0,
            moeda: flightResults.data[0] ? .price ? .currency || 'BRL'
        };

        console.log(`Processando ${meta.totalVoos} voos encontrados`);

        // Mapear os resultados para um formato padronizado
        const voos = flightResults.data.map(voo => {
            try {
                // Informações básicas
                const preco = parseFloat(voo.price.total) || 0;
                const moeda = voo.price.currency || 'BRL';

                // Construir detalhes do itinerário
                const itinerario = voo.itineraries.map(itinerario => {
                    // Calcular duração total em minutos
                    let duracaoTotal = 0;

                    // Processar cada segmento (voo)
                    const segmentos = itinerario.segments.map(segmento => {
                        // Calcular duração do segmento
                        const duracao = segmento.duration ? parseInt(segmento.duration.replace('PT', '').replace('H', '').replace('M', '')) : 0;
                        duracaoTotal += duracao;

                        return {
                            aeroportoSaida: segmento.departure.iataCode,
                            cidadeSaida: COMMON_BR_IATA_CODES[segmento.departure.iataCode] || segmento.departure.iataCode,
                            horarioSaida: segmento.departure.at,
                            aeroportoChegada: segmento.arrival.iataCode,
                            cidadeChegada: COMMON_BR_IATA_CODES[segmento.arrival.iataCode] || segmento.arrival.iataCode,
                            horarioChegada: segmento.arrival.at,
                            companhia: getAirlineName(segmento.carrierCode) || segmento.carrierCode,
                            codigoCompanhia: segmento.carrierCode,
                            numeroVoo: segmento.number,
                            duracao: segmento.duration,
                            duracaoMinutos: duracao,
                            aviao: segmento.aircraft ? .code || '',
                            paradas: 0 // Este é um segmento único, então 0 paradas
                        };
                    });

                    // Calcular número total de paradas (número de segmentos - 1)
                    const numeroParadas = segmentos.length - 1;

                    return {
                        segmentos,
                        numeroParadas,
                        duracaoTotal: itinerario.duration || '',
                        duracaoTotalMinutos: duracaoTotal
                    };
                });

                // Construir resultado final para este voo
                return {
                    id: voo.id,
                    preco,
                    moeda,
                    itinerario,
                    ida: itinerario[0] || null,
                    volta: itinerario.length > 1 ? itinerario[1] : null,
                    multicitiParadas: itinerario[0] ? .numeroParadas || 0,
                    duracaoTotal: itinerario[0] ? .duracaoTotal || '',
                    duracaoTotalMinutos: itinerario[0] ? .duracaoTotalMinutos || 0,
                    aeroportoSaida: itinerario[0] ? .segmentos[0] ? .aeroportoSaida || '',
                    cidadeSaida: itinerario[0] ? .segmentos[0] ? .cidadeSaida || '',
                    horarioSaida: itinerario[0] ? .segmentos[0] ? .horarioSaida || '',
                    aeroportoChegada: itinerario[0] ? .segmentos[itinerario[0] ? .segmentos.length - 1] ? .aeroportoChegada || '',
                    cidadeChegada: itinerario[0] ? .segmentos[itinerario[0] ? .segmentos.length - 1] ? .cidadeChegada || '',
                    horarioChegada: itinerario[0] ? .segmentos[itinerario[0] ? .segmentos.length - 1] ? .horarioChegada || '',
                    companhiasPrincipais: Array.from(new Set(itinerario[0] ? .segmentos.map(s => s.codigoCompanhia) || [])),
                    companhia: itinerario[0] ? .segmentos[0] ? .companhia || '',
                    dadosOriginais: voo
                };
            } catch (error) {
                console.error('Erro ao processar voo individual:', error);
                return null;
            }
        }).filter(Boolean); // Remover quaisquer resultados nulos

        // Ordenar por preço
        voos.sort((a, b) => a.preco - b.preco);

        return {
            success: true,
            meta,
            voos,
            rawData: flightResults
        };
    } catch (error) {
        console.error('Erro ao processar resultados de voos:', error);
        return {
            success: false,
            message: `Erro ao processar resultados: ${error.message}`,
            voos: []
        };
    }
}

// Função para buscar voos usando o backend
export async function searchFlights(params) {
    console.log('Iniciando busca de voos com parâmetros:', params);

    try {
        // Validar parâmetros antes de enviar
        const validatedParams = validateSearchParams(params);

        // Verificar limites de taxa de requisição
        if (shouldThrottleRequests()) {
            throw new Error('Muitas requisições em um curto período. Por favor, aguarde um pouco e tente novamente.');
        }

        // Usar o background script para fazer a requisição para o backend
        console.log('Enviando solicitação para o background script');

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                    action: 'searchFlights',
                    params: {
                        origin: validatedParams.origin,
                        destination: validatedParams.destination,
                        date: validatedParams.date,
                        adults: params.adults || 1,
                        cabinClass: params.cabinClass || 'ECONOMY'
                    }
                },
                response => {
                    if (chrome.runtime.lastError) {
                        console.error('Erro ao enviar mensagem para background:', chrome.runtime.lastError);
                        reject(new Error('Erro na comunicação com o script de fundo: ' + chrome.runtime.lastError.message));
                        return;
                    }

                    if (!response) {
                        console.error('Resposta vazia do background script');
                        reject(new Error('Não foi recebida resposta do script de fundo'));
                        return;
                    }

                    console.log('Resposta recebida do background script:', response);

                    if (!response.success) {
                        reject(new Error(response.error || 'Erro ao buscar voos'));
                        return;
                    }

                    // Processar e retornar os resultados
                    const processedResults = processFlightResults(response.data, validatedParams);
                    incrementRequestCount();
                    resolve(processedResults);
                }
            );
        });
    } catch (error) {
        console.error('Erro ao buscar voos:', error);
        throw error;
    }
}

// Função para filtrar voos por duração
export function filterFlightsByDuration(voos, options = {}) {
    console.log('Filtrando voos por duração:', options);

    const { maxDurationMinutes = 1440 } = options; // 24 horas por padrão

    if (!Array.isArray(voos) || voos.length === 0) {
        return [];
    }

    return voos.filter(voo => {
        // Verificar se o voo tem informação de duração
        if (!voo || !voo.duracaoTotalMinutos) {
            return false;
        }

        // Filtrar com base na duração máxima
        return voo.duracaoTotalMinutos <= maxDurationMinutes;
    });
}

// Função para buscar voos mais rápidos (wrapper que já faz o filtro)
export async function searchFastFlights(params, options = {}) {
    console.log('Buscando voos rápidos:', params, options);

    try {
        // Definir opções padrão
        const { maxDurationMinutes = 480 } = options; // 8 horas por padrão

        // Buscar voos normalmente
        const resultado = await searchFlights(params);

        // Se não houver resultados ou erro, retornar
        if (!resultado.success || !resultado.voos || resultado.voos.length === 0) {
            return resultado;
        }

        // Filtrar apenas os voos rápidos
        const voosFiltrados = filterFlightsByDuration(resultado.voos, { maxDurationMinutes });

        // Atualizar meta com contagem filtrada
        resultado.meta.totalVoosFiltrados = voosFiltrados.length;
        resultado.meta.filtroAplicado = 'duração máxima de ' + maxDurationMinutes + ' minutos';

        // Retornar com voos filtrados
        return {
            ...resultado,
            voos: voosFiltrados
        };
    } catch (error) {
        console.error('Erro ao buscar voos rápidos:', error);
        throw error;
    }
}

// Helper para calcular tempo de espera entre voos
function calcularTempoEspera(partida, chegada) {
    // Converter strings de data/hora para objetos Date
    const dataChegada = new Date(chegada);
    const dataPartida = new Date(partida);

    // Calcular diferença em milissegundos
    const diferencaMs = dataPartida - dataChegada;

    // Converter para minutos
    return Math.floor(diferencaMs / (1000 * 60));
}