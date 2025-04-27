import { config } from '../../config.js';

console.log('flightService.js carregado!');

let accessToken = null;
let tokenExpiry = null;
let requestCount = 0;
let lastRequestTime = Date.now();
let useTestEnvironment = false; // Flag para controlar qual ambiente usar

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

// URLs da API para produção e teste
const API_ENVIRONMENTS = {
    production: {
        BASE_URL: 'https://api.amadeus.com/v2',
        TOKEN_URL: 'https://api.amadeus.com/v1/security/oauth2/token'
    },
    test: {
        BASE_URL: 'https://test.api.amadeus.com/v2',
        TOKEN_URL: 'https://test.api.amadeus.com/v1/security/oauth2/token'
    }
};

// Função para trocar o ambiente usado
function toggleApiEnvironment() {
    useTestEnvironment = !useTestEnvironment;
    // Reset do token quando trocamos de ambiente
    accessToken = null;
    tokenExpiry = null;
    console.log(`Trocando para ambiente ${useTestEnvironment ? 'de TESTE' : 'de PRODUÇÃO'}`);
    return useTestEnvironment;
}

// Função para obter as URLs corretas do ambiente atual
function getApiUrls() {
    // Forçar o uso apenas do ambiente de teste para evitar problemas
    useTestEnvironment = true;
    return API_ENVIRONMENTS.test;
}

// Função para obter access token
async function getAccessToken() {
    try {
        // Se o token atual ainda é válido, retorná-lo
        if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
            return accessToken;
        }

        // Obter URLs baseadas no ambiente atual
        const apiUrls = getApiUrls();

        // Preparar dados para solicitação de token
        const data = new URLSearchParams();
        data.append('grant_type', 'client_credentials');
        data.append('client_id', config.API.CLIENT_ID);
        data.append('client_secret', config.API.CLIENT_SECRET);

        console.log(`Obtendo novo access token para ambiente ${useTestEnvironment ? 'de TESTE' : 'de PRODUÇÃO'}`);

        // Fazer solicitação de token
        const response = await fetch(apiUrls.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        });

        if (!response.ok) {
            // Se a resposta não for OK, tentar extrair informações úteis do erro
            const responseText = await response.text();
            console.error('Erro ao obter token:', response.status, responseText);

            // Verificar especificamente erros relacionados a CSP (Content Security Policy)
            if (responseText.includes('security') && responseText.includes('policy')) {
                throw new Error('Possível erro de CSP (Content Security Policy). Verifique as configurações de segurança do navegador.');
            }

            throw new Error(`Falha ao obter access token: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();
        accessToken = tokenData.access_token;

        // Definir expiração (convertendo segundos para milissegundos e subtraindo 60 segundos para folga)
        tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000;

        console.log(`Token obtido com sucesso. Expira em ${Math.round((tokenExpiry - Date.now())/1000/60)} minutos`);

        return accessToken;
    } catch (error) {
        console.error('Erro ao obter access token:', error);
        throw error;
    }
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
        console.warn('Parâmetros de busca inválidos: origem ou destino não fornecidos');
        return { valid: false, message: 'Origem e destino são obrigatórios.' };
    }

    // Verificar se os códigos de aeroporto são válidos
    if (!isValidIata(normalizedParams.origin) || !isValidIata(normalizedParams.destination)) {
        console.warn('Parâmetros de busca inválidos: origem ou destino não são códigos IATA válidos');
        return { valid: false, message: 'Códigos de aeroporto inválidos.' };
    }

    // Se não for um aeroporto brasileiro comum, emitir um aviso
    if (!Object.keys(COMMON_BR_IATA_CODES).includes(normalizedParams.origin.toUpperCase())) {
        console.log(`Informação: ${normalizedParams.origin} não está na lista de aeroportos brasileiros mais comuns, mas a busca funcionará normalmente.`);
    }
    if (!Object.keys(COMMON_BR_IATA_CODES).includes(normalizedParams.destination.toUpperCase())) {
        console.log(`Informação: ${normalizedParams.destination} não está na lista de aeroportos brasileiros mais comuns, mas a busca funcionará normalmente.`);
    }

    let dateMessage = null;

    // Se a busca flexível estiver ativada, definimos a data para hoje
    // Isso permite buscar as melhores ofertas disponíveis
    if (normalizedParams.buscaFlexivel || normalizedParams.dataValidada) {
        console.log('Busca flexível detectada ou data já validada. Ignorando validação adicional de data.');
        if (!normalizedParams.date) {
            const today = new Date();
            // Formatar data consistentemente
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            normalizedParams.date = `${yyyy}-${mm}-${dd}`;
        }
        dateMessage = 'Buscando as melhores promoções disponíveis em diversas datas.';
    }
    // Se não for busca flexível, verificamos se a data é válida
    else if (normalizedParams.date) {
        // Verificar se a data está em formato válido
        const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(normalizedParams.date);

        if (!isValidDateFormat) {
            console.warn(`Data em formato inválido: ${normalizedParams.date}. Tentando converter.`);
            try {
                const dateObj = new Date(normalizedParams.date);
                if (!isNaN(dateObj.getTime())) {
                    // Data válida, converter para formato YYYY-MM-DD
                    const yyyy = dateObj.getFullYear();
                    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const dd = String(dateObj.getDate()).padStart(2, '0');
                    normalizedParams.date = `${yyyy}-${mm}-${dd}`;
                    console.log(`Data convertida para: ${normalizedParams.date}`);
                } else {
                    console.warn('Data não pôde ser convertida. Usando data atual.');
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    normalizedParams.date = `${yyyy}-${mm}-${dd}`;
                    dateMessage = 'A data fornecida era inválida e foi ajustada para hoje.';
                }
            } catch (e) {
                console.error('Erro ao processar data:', e);
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                normalizedParams.date = `${yyyy}-${mm}-${dd}`;
                dateMessage = 'A data fornecida era inválida e foi ajustada para hoje.';
            }
        }

        // Agora verificar se a data do voo não é anterior a hoje
        const flightDate = new Date(normalizedParams.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calcular a data máxima permitida (hoje + 1 ano)
        const maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        if (flightDate < today) {
            console.warn('Data do voo é anterior a hoje. Ajustando para hoje.');
            // Formatar data consistentemente
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            normalizedParams.date = `${yyyy}-${mm}-${dd}`;
            dateMessage = 'A data selecionada era no passado e foi ajustada para hoje.';
        } else if (flightDate > maxDate) {
            console.warn(`Data do voo é superior a um ano a partir de hoje. Ajustando para data máxima permitida.`);
            // Formatar data consistentemente
            const yyyy = maxDate.getFullYear();
            const mm = String(maxDate.getMonth() + 1).padStart(2, '0');
            const dd = String(maxDate.getDate()).padStart(2, '0');
            normalizedParams.date = `${yyyy}-${mm}-${dd}`;
            dateMessage = 'A data selecionada era superior a um ano no futuro e foi ajustada para a data máxima permitida.';
        }
    }
    // Se não temos data e não é busca flexível, definimos para hoje
    else {
        try {
            console.warn('Nenhuma data fornecida. Usando data atual.');
            const today = new Date();
            // Certifique-se de que a data está no formato correto (YYYY-MM-DD)
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            normalizedParams.date = `${yyyy}-${mm}-${dd}`;
            dateMessage = 'Nenhuma data foi especificada. Mostrando resultados para hoje.';
        } catch (e) {
            console.error('Erro ao definir data padrão:', e);
            // Garantir que temos uma data, mesmo se houver erro
            normalizedParams.date = new Date().toISOString().split('T')[0];
            dateMessage = 'Utilizando data atual para a busca.';
        }
    }

    // Verificar se a origem e o destino são iguais
    if (normalizedParams.origin.toUpperCase() === normalizedParams.destination.toUpperCase()) {
        console.warn('Origem e destino são iguais. Isso pode não retornar resultados válidos.');
        return { valid: false, message: 'Origem e destino não podem ser iguais.' };
    }

    return { valid: true, date: normalizedParams.date, dateMessage, normalizedParams };
}

// Função para processar os resultados dos voos
export function processFlightResults(flightResults, params = {}) {
    try {
        // Verificar se temos resultados
        if (!flightResults || !flightResults.data || flightResults.data.length === 0) {
            console.warn('Nenhum voo encontrado para os parâmetros fornecidos.');
            return [];
        }

        console.log(`Processando ${flightResults.data.length} resultados de voos.`);

        // Mapear e enriquecer os resultados
        let voos = flightResults.data.map(flight => {
            const priceRaw = flight.price.total;
            const price = parseFloat(priceRaw);

            // Obter o nome da companhia principal
            let airline = 'Desconhecida';
            let airlineCode = '';
            let conexoes = []; // Definir conexoes aqui

            if (flight.itineraries && flight.itineraries.length > 0 &&
                flight.itineraries[0].segments && flight.itineraries[0].segments.length > 0) {
                airlineCode = flight.itineraries[0].segments[0].carrierCode;
                airline = getAirlineName(airlineCode) || `Companhia ${airlineCode}`;
            }

            // Calcular desconto especial baseado na companhia aérea
            let discountPercent = 0;
            let specialOffer = false;

            // Aplicar descontos baseados na companhia aérea
            if (airlineCode === 'G3') { // GOL
                discountPercent = 3;
                specialOffer = true;
            } else if (airlineCode === 'AD') { // Azul
                discountPercent = 5;
                specialOffer = true;
            } else if (airlineCode === 'LA') { // LATAM
                discountPercent = 4;
                specialOffer = true;
            }

            // Calcular o preço com desconto
            const priceWithDiscount = price * (1 - discountPercent / 100);

            // Extrair informações do itinerário
            let departureDate = '';
            let departureTime = '';
            let arrivalTime = '';
            let duration = '';
            let stops = 0;

            if (flight.itineraries && flight.itineraries.length > 0) {
                const itinerary = flight.itineraries[0];

                if (itinerary.segments && itinerary.segments.length > 0) {
                    const firstSegment = itinerary.segments[0];
                    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

                    // Melhorar o processamento de datas e horários
                    const departureDateTime = new Date(firstSegment.departure.at);
                    const arrivalDateTime = new Date(lastSegment.arrival.at);

                    departureDate = departureDateTime.toISOString().split('T')[0];
                    departureTime = departureDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    arrivalTime = arrivalDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

                    // Calcular duração total em minutos considerando fuso horário
                    const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
                    const totalDurationMinutes = Math.round(durationMs / (1000 * 60));

                    // Formatar duração de maneira mais precisa
                    const durationHours = Math.floor(totalDurationMinutes / 60);
                    const durationMinutes = totalDurationMinutes % 60;
                    duration = `${durationHours.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}`;

                    stops = itinerary.segments.length - 1;

                    // Adicionar informações de conexão se houver escalas
                    if (stops > 0) {
                        conexoes = itinerary.segments.slice(1).map(segment => ({
                            aeroporto: segment.departure.iataCode,
                            tempoEspera: calcularTempoEspera(
                                new Date(segment.departure.at),
                                new Date(segment.arrival.at)
                            )
                        }));
                    }
                }
            }

            return {
                id: flight.id,
                airline,
                airlineCode,
                price: price.toFixed(2),
                priceWithDiscount: priceWithDiscount.toFixed(2),
                discountPercent,
                specialOffer,
                departureDate,
                departureTime,
                arrivalTime,
                duration,
                stops,
                conexoes, // Adicionar conexoes aqui
                uniqueRouteId: `${params.origin}-${params.destination}`,
                isBestPrice: false, // Será definido abaixo
                detail: flight, // Mantemos os detalhes completos

                // Adicionando campos compatíveis com a interface
                companhia: airline,
                origem: params.origin,
                destino: params.destination,
                preco: parseFloat(price.toFixed(2)),
                precoComDesconto: parseFloat(priceWithDiscount.toFixed(2)),
                horarioPartida: departureTime,
                horarioChegada: arrivalTime,
                duracao: duration,
                escalas: stops,
                data: departureDate
            };
        });

        // Ordenar voos por preço ascendente
        voos.sort((a, b) => parseFloat(a.priceWithDiscount) - parseFloat(b.priceWithDiscount));

        // Marcar o voo mais barato como melhor preço
        if (voos.length > 0) {
            voos[0].isBestPrice = true;
        }

        console.log(`Voos processados: ${voos.length}`);
        return voos;
    } catch (error) {
        console.error('Erro ao processar resultados de voos:', error);
        return [];
    }
}

// Exportando a função searchFlights
export async function searchFlights(params) {
    console.log('Iniciando pesquisa de voos com parâmetros:', params);

    // Normalizar e validar parâmetros
    const {
        origin,
        destination,
        date,
        buscaFlexivel = false,
        retries = 0
    } = params;

    // Validar os parâmetros
    if (!origin || !destination) {
        throw new Error('Os códigos de origem e destino são obrigatórios');
    }

    // Validar os códigos IATA e obter mensagens
    const validacao = validateSearchParams({ origin, destination, date, buscaFlexivel });

    if (!validacao.valid) {
        return { error: validacao.message, results: [] };
    }

    // Armazenar a mensagem sobre a data para uso posterior
    const mensagemData = validacao.dateMessage;
    const dataValidada = validacao.date;

    // Adaptar parâmetros para o formato esperado pela API
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    // Parâmetros padrão
    let searchParams = {
        origin,
        destination,
        adults: 1,
        currency: 'BRL',
        cabinClass: 'ECONOMY',
        nonStop: false // Por padrão, permitir voos com escala
    };

    // Usar a data validada pela função validateSearchParams
    const formattedDate = dataValidada;

    if (!formattedDate) {
        throw new Error('Data de partida inválida ou não fornecida');
    }

    searchParams = {
        ...searchParams,
        outboundDate: formattedDate
    };

    try {
        // Verificar limites de requisição
        if (shouldThrottleRequests()) {
            console.warn('Limite de requisições atingido. Espere alguns minutos antes de tentar novamente.');
            return { error: 'Muitas requisições. Tente novamente em alguns minutos.', results: [] };
        }

        // Obter token de acesso
        const token = await getAccessToken();
        if (!token) {
            console.error('Não foi possível obter token de acesso');
            return { error: 'Serviço indisponível no momento. Tente novamente mais tarde.', results: [] };
        }

        let tentativas = 0;
        const maxTentativas = 2;
        let responseData;

        while (tentativas < maxTentativas && !responseData) {
            tentativas++;
            console.log(`Tentativa ${tentativas} de ${maxTentativas} para buscar voos`, searchParams);

            try {
                // Construir a URL base da API
                let apiUrl = `${API_ENVIRONMENTS.test.BASE_URL}/shopping/flight-offers`;

                // Adicionar parâmetros comuns
                const urlParams = new URLSearchParams();
                urlParams.append('originLocationCode', searchParams.origin);
                urlParams.append('destinationLocationCode', searchParams.destination);

                // Validar e formatar datas
                const formatarDataParaAPI = (dataStr) => {
                    // Verifica se a data está no formato YYYY-MM-DD
                    const regexData = /^\d{4}-\d{2}-\d{2}$/;
                    if (regexData.test(dataStr)) {
                        return dataStr; // Já está no formato correto
                    }

                    // Se não estiver no formato correto, tenta converter
                    try {
                        const data = new Date(dataStr);
                        if (isNaN(data.getTime())) {
                            throw new Error('Data inválida');
                        }
                        const yyyy = data.getFullYear();
                        const mm = String(data.getMonth() + 1).padStart(2, '0');
                        const dd = String(data.getDate()).padStart(2, '0');
                        return `${yyyy}-${mm}-${dd}`;
                    } catch (e) {
                        console.error('Erro ao formatar data:', e);
                        // Retorna a data atual como fallback
                        const hoje = new Date();
                        const yyyy = hoje.getFullYear();
                        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
                        const dd = String(hoje.getDate()).padStart(2, '0');
                        return `${yyyy}-${mm}-${dd}`;
                    }
                };

                // Para busca normal, usamos a data específica
                urlParams.append('departureDate', formatarDataParaAPI(searchParams.outboundDate));
                urlParams.append('max', '20');

                // Adicionar parâmetro nonStop apenas se for especificado
                if (searchParams.nonStop) {
                    urlParams.append('nonStop', 'true');
                }

                // Adicionar outros parâmetros
                urlParams.append('adults', searchParams.adults.toString());
                urlParams.append('currencyCode', searchParams.currency);
                urlParams.append('travelClass', searchParams.cabinClass);

                // Combinar URL base com parâmetros
                apiUrl += `?${urlParams.toString()}`;
                console.log('URL COMPLETA da API para busca de voos:', apiUrl);

                // Fazer a requisição
                console.log('Fazendo requisição com token:', token.substring(0, 10) + '...');
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // Tentar obter mais detalhes sobre o erro
                    let errorDetails = '';
                    try {
                        const errorResponse = await response.text();
                        errorDetails = errorResponse;
                        console.error('Detalhes do erro na requisição:', errorResponse);
                    } catch (e) {
                        console.error('Não foi possível obter detalhes do erro:', e);
                    }

                    console.warn(`Erro na resposta da API (Tentativa ${tentativas}): ${response.status} - ${response.statusText}`);

                    // Se for a primeira tentativa e houver erro, tentar trocar o ambiente
                    if (tentativas === 1) {
                        console.log('Tentando trocar ambiente de API...');
                        toggleApiEnvironment();
                        // Continuar para a próxima tentativa
                        continue;
                    }

                    throw new Error(`Erro na API: ${response.status} - ${response.statusText} - Detalhes: ${errorDetails}`);
                }

                responseData = await response.json();
                console.log(`Dados recebidos da API com ${responseData?.data?.length || 0} resultados:`,
                    responseData ? (responseData.data ? responseData.data.slice(0, 2) : 'Sem dados') : 'Sem dados');

                // Incrementar contador de requisições bem-sucedidas
                incrementRequestCount();

                // Processar resultados
                const resultados = processFlightResults(responseData, searchParams);

                // Ordenar resultados por preço crescente explicitamente no código
                resultados.sort((a, b) => parseFloat(a.priceWithDiscount) - parseFloat(b.priceWithDiscount));

                // Adicionar informações adicionais aos resultados
                const resultadosAgrupados = {
                    results: resultados,
                    query: {
                        origin: searchParams.origin,
                        originName: COMMON_BR_IATA_CODES[searchParams.origin] || searchParams.origin,
                        destination: searchParams.destination,
                        destinationName: COMMON_BR_IATA_CODES[searchParams.destination] || searchParams.destination,
                        departureDate: formatarDataParaAPI(searchParams.outboundDate),
                        adults: searchParams.adults,
                        cabinClass: searchParams.cabinClass
                    },
                    meta: {
                        count: resultados.length,
                        currency: searchParams.currency,
                        timestamp: new Date().toISOString(),
                        mensagemData: mensagemData // Incluir a mensagem sobre a data
                    },
                    // Manter compatibilidade com o código existente que pode esperar os resultados em "voos"
                    voos: resultados
                };

                // Marcar os resultados para informar sobre ajustes de data
                if (mensagemData) {
                    resultadosAgrupados.results.forEach(voo => {
                        voo.dataAjustada = mensagemData;
                    });
                }

                // Adicionar urls de reserva para cada voo
                resultadosAgrupados.results.forEach(voo => {
                    // Para cada voo, construir a URL de reserva baseada na companhia aérea
                    switch (voo.airlineCode) {
                        case 'G3': // GOL
                            voo.bookingUrl = `https://www.voegol.com.br/pt`;
                            break;
                        case 'LA': // LATAM
                        case 'JJ':
                            voo.bookingUrl = `https://www.latamairlines.com/br/pt`;
                            break;
                        case 'AD': // Azul
                            voo.bookingUrl = `https://www.voeazul.com.br/`;
                            break;
                        default:
                            // Para outras companhias, usar um site de agregador
                            voo.bookingUrl = `https://www.decolar.com/`;
                    }
                });

                // Adicionar informações de dia, data e hora para cada voo
                if (Array.isArray(responseData.data) && responseData.data.length > 0) {
                    responseData.data = responseData.data.map(voo => {
                        if (voo.outbound && voo.outbound.departureDate) {
                            const departureDate = new Date(voo.outbound.departureDate);
                            const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                            const dia = diasSemana[departureDate.getDay()];
                            const data = departureDate.toLocaleDateString('pt-BR');
                            const hora = departureDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                            voo.outbound.formattedDepartureInfo = {
                                dia,
                                data,
                                hora
                            };
                        }
                        return voo;
                    });
                }

                return resultadosAgrupados;
            } catch (error) {
                console.error(`Erro na tentativa ${tentativas}:`, error);

                if (tentativas < maxTentativas) {
                    // Se houver erro com parâmetros complexos, tentar simplificar na segunda tentativa
                    if (tentativas === 1) {
                        try {
                            console.log('Tentando com parâmetros simplificados...');

                            // Construir URL simplificada
                            let urlSimplificada = `${API_ENVIRONMENTS.test.BASE_URL}/shopping/flight-offers?originLocationCode=${searchParams.origin}&destinationLocationCode=${searchParams.destination}`;
                            urlSimplificada += `&departureDate=${formatarDataParaAPI(searchParams.outboundDate)}`;
                            urlSimplificada += `&adults=${searchParams.adults}&currencyCode=BRL&max=20`;

                            console.log('URL simplificada:', urlSimplificada);

                            const respostaSimplificada = await fetch(urlSimplificada, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (!respostaSimplificada.ok) {
                                // Tentar obter mais detalhes sobre o erro
                                let errorDetailsSimplified = '';
                                try {
                                    const errorResponseSimplified = await respostaSimplificada.text();
                                    errorDetailsSimplified = errorResponseSimplified;
                                    console.error('Detalhes do erro (tentativa simplificada):', errorResponseSimplified);
                                } catch (e) {
                                    console.error('Não foi possível obter detalhes do erro na tentativa simplificada:', e);
                                }
                                throw new Error(`Erro na API (tentativa simplificada): ${respostaSimplificada.status} - ${respostaSimplificada.statusText} - Detalhes: ${errorDetailsSimplified}`);
                            }

                            if (respostaSimplificada.ok) {
                                const dadosSimplificados = await respostaSimplificada.json();
                                console.log('Resposta com parâmetros simplificados obtida com sucesso');

                                const resultadosSimplificados = processFlightResults(dadosSimplificados, searchParams);
                                resultadosSimplificados.sort((a, b) => parseFloat(a.priceWithDiscount) - parseFloat(b.priceWithDiscount));

                                return {
                                    results: resultadosSimplificados,
                                    query: {
                                        origin: searchParams.origin,
                                        originName: COMMON_BR_IATA_CODES[searchParams.origin] || searchParams.origin,
                                        destination: searchParams.destination,
                                        destinationName: COMMON_BR_IATA_CODES[searchParams.destination] || searchParams.destination,
                                        departureDate: searchParams.outboundDate ? `${searchParams.outboundDate.start} até ${searchParams.outboundDate.end}` : '',
                                        adults: searchParams.adults,
                                        buscaFlexivel: buscaFlexivel
                                    },
                                    meta: {
                                        count: resultadosSimplificados.length,
                                        currency: 'BRL',
                                        timestamp: new Date().toISOString(),
                                        buscaFlexivel: buscaFlexivel
                                    }
                                };
                            }
                        } catch (simplifiedError) {
                            console.error('Erro ao tentar com parâmetros simplificados:', simplifiedError);
                        }
                    }
                }
            }
        }

        // Se chegou aqui sem responseData, retornar erro
        return {
            error: 'Não foi possível encontrar voos com os parâmetros especificados.',
            results: []
        };
    } catch (error) {
        console.error('Erro ao buscar voos:', error);
        return {
            error: 'Erro ao buscar voos. Por favor, tente novamente mais tarde.',
            results: []
        };
    }
}

/**
 * Filtra os voos com base na duração total e tempo de conexão
 * Útil para quando o usuário quer encontrar as viagens mais rápidas
 * @param {Array} voos - Lista de voos processados pelo processFlightResults
 * @param {Object} options - Opções de filtragem
 * @param {number} options.maxDurationHours - Duração máxima total em horas (opcional)
 * @param {number} options.maxConnectionMinutes - Tempo máximo de conexão em minutos (opcional)
 * @param {boolean} options.preferNonStop - Priorizar voos diretos (padrão: true)
 * @param {number} options.limit - Limite de resultados (padrão: 10)
 * @returns {Array} - Voos filtrados e ordenados por duração
 */
export function filterFlightsByDuration(voos, options = {}) {
    try {
        if (!voos || !Array.isArray(voos) || voos.length === 0) {
            console.warn('Nenhum voo fornecido para filtrar por duração');
            return [];
        }

        console.log(`Filtrando ${voos.length} voos por duração com opções:`, options);

        // Configurações padrão
        const config = {
            maxDurationHours: options.maxDurationHours || 24,
            maxConnectionMinutes: options.maxConnectionMinutes || 240,
            preferNonStop: options.preferNonStop !== false,
            limit: options.limit || 10
        };

        // Converter maxDurationHours para minutos para facilitar a comparação
        const maxDurationMinutes = config.maxDurationHours * 60;

        // Processar cada voo para calcular a duração total em minutos
        const voosProcessados = voos.map(voo => {
            // Converter a duração de string "2h 30m" para minutos
            let durationMinutes = 0;
            if (voo.duration) {
                const hoursMatch = voo.duration.match(/(\d+)h/);
                const minutesMatch = voo.duration.match(/(\d+)m/);

                const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

                durationMinutes = hours * 60 + minutes;
            }

            // Verificar se o voo tem detalhes suficientes para análise
            const hasDetailedSegments = voo.detail &&
                voo.detail.itineraries &&
                voo.detail.itineraries.length > 0 &&
                voo.detail.itineraries[0].segments &&
                voo.detail.itineraries[0].segments.length > 0;

            // Calcular tempo total de conexão se houver segmentos detalhados
            let totalConnectionMinutes = 0;
            let segmentStartTimes = [];
            let segmentEndTimes = [];

            if (hasDetailedSegments) {
                const segments = voo.detail.itineraries[0].segments;

                // Coletar horários de início e fim de cada segmento
                segments.forEach(segment => {
                    segmentStartTimes.push(new Date(segment.departure.at));
                    segmentEndTimes.push(new Date(segment.arrival.at));
                });

                // Calcular tempo de conexão entre segmentos
                for (let i = 0; i < segments.length - 1; i++) {
                    const connectionMinutes = (segmentStartTimes[i + 1] - segmentEndTimes[i]) / 60000;
                    totalConnectionMinutes += connectionMinutes;
                }
            }

            return {
                ...voo,
                durationMinutes,
                totalConnectionMinutes,
                hasDetailedSegments
            };
        });

        // Filtrar voos com base na duração máxima
        let voosFiltrados = voosProcessados.filter(voo => {
            // Filtrar por duração total máxima
            if (voo.durationMinutes > maxDurationMinutes) {
                return false;
            }

            // Filtrar por tempo máximo de conexão, se tivermos detalhes suficientes
            if (voo.hasDetailedSegments && voo.stops > 0 && voo.totalConnectionMinutes > config.maxConnectionMinutes) {
                return false;
            }

            return true;
        });

        // Ordenação principal: primeiro por voos diretos (se preferência ativada), depois por duração
        voosFiltrados.sort((a, b) => {
            // Se preferência por voos diretos está ativada
            if (config.preferNonStop) {
                // Se um é direto e o outro não
                if (a.stops === 0 && b.stops > 0) return -1;
                if (a.stops > 0 && b.stops === 0) return 1;
            }

            // Ordenar por duração
            return a.durationMinutes - b.durationMinutes;
        });

        // Limitar quantidade de resultados
        const resultados = voosFiltrados.slice(0, config.limit);

        console.log(`Retornando ${resultados.length} voos filtrados por duração`);
        return resultados;
    } catch (error) {
        console.error('Erro ao filtrar voos por duração:', error);
        return voos.slice(0, options.limit || 10);
    }
}

/**
 * Busca voos com foco em viagens mais rápidas (conexões curtas)
 * @param {Object} params - Parâmetros de busca no mesmo formato da função searchFlights
 * @param {Object} options - Opções de filtragem para viagens rápidas
 * @param {number} options.maxDurationHours - Duração máxima total em horas (padrão: 12)
 * @param {number} options.maxConnectionMinutes - Tempo máximo de conexão (padrão: 120 min = 2h)
 * @returns {Object} - Objeto com os resultados dos voos mais rápidos
 */
export async function searchFastFlights(params, options = {}) {
    try {
        console.log('Iniciando busca de voos rápidos com parâmetros:', params);
        console.log('Opções para voos rápidos:', options);

        // Configurar opções padrão para voos rápidos
        const fastOptions = {
            maxDurationHours: options.maxDurationHours || 12,
            maxConnectionMinutes: options.maxConnectionMinutes || 120,
            preferNonStop: options.preferNonStop !== false,
            limit: options.limit || 10
        };

        // Realizar a busca normal de voos
        const resultadosBusca = await searchFlights(params);

        // Verificar se temos resultados válidos
        if (!resultadosBusca || resultadosBusca.error || !resultadosBusca.results || resultadosBusca.results.length === 0) {
            console.warn('Nenhum resultado encontrado na busca de voos rápidos');
            return resultadosBusca; // Retornar o resultado original (que já contém mensagem de erro)
        }

        // Aplicar o filtro de voos rápidos nos resultados
        const voosRapidos = filterFlightsByDuration(resultadosBusca.results, fastOptions);

        // Se não encontrarmos nenhum voo que atenda aos critérios, retornar alguns resultados originais
        if (voosRapidos.length === 0) {
            console.warn('Nenhum voo atendeu aos critérios de viagem rápida');

            // Retornar os voos originais ordenados por duração, com uma mensagem informativa
            const voosPorDuracao = [...resultadosBusca.results].sort((a, b) => {
                // Extrair duração em minutos para comparação
                const getDurationInMinutes = (duration) => {
                    if (!duration) return Number.MAX_SAFE_INTEGER;
                    const hoursMatch = duration.match(/(\d+)h/);
                    const minutesMatch = duration.match(/(\d+)m/);
                    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
                    return hours * 60 + minutes;
                };

                return getDurationInMinutes(a.duration) - getDurationInMinutes(b.duration);
            });

            return {
                ...resultadosBusca,
                results: voosPorDuracao.slice(0, fastOptions.limit),
                voos: voosPorDuracao.slice(0, fastOptions.limit),
                meta: {
                    ...resultadosBusca.meta,
                    count: Math.min(voosPorDuracao.length, fastOptions.limit),
                    fastFlightSearch: true,
                    fastFlightMessage: 'Não encontramos voos que atendam aos critérios de viagem rápida. Exibindo os voos mais curtos disponíveis.'
                }
            };
        }

        // Criar o objeto de resposta com os voos filtrados
        const resposta = {
            ...resultadosBusca,
            results: voosRapidos,
            voos: voosRapidos, // Para manter compatibilidade
            meta: {
                ...resultadosBusca.meta,
                count: voosRapidos.length,
                fastFlightSearch: true,
                maxDurationHours: fastOptions.maxDurationHours,
                maxConnectionMinutes: fastOptions.maxConnectionMinutes
            }
        };

        // Para cada voo rápido, adicionar um indicador visual
        resposta.results.forEach(voo => {
            voo.isFastFlight = true;

            // Calcular economia de tempo comparado à média dos voos da rota
            if (voo.durationMinutes) {
                // Calcular tempo médio de duração para esta rota
                const temposTotais = resultadosBusca.results
                    .map(v => {
                        if (!v.duration) return null;
                        const hMatch = v.duration.match(/(\d+)h/);
                        const mMatch = v.duration.match(/(\d+)m/);
                        const h = hMatch ? parseInt(hMatch[1]) : 0;
                        const m = mMatch ? parseInt(mMatch[1]) : 0;
                        return h * 60 + m;
                    })
                    .filter(t => t !== null);

                if (temposTotais.length > 0) {
                    const tempoMedio = temposTotais.reduce((sum, t) => sum + t, 0) / temposTotais.length;
                    const economiaMinutos = Math.max(0, Math.round(tempoMedio - voo.durationMinutes));

                    if (economiaMinutos > 30) {
                        voo.timeSaved = economiaMinutos;
                        voo.timeSavedFormatted = `${Math.floor(economiaMinutos / 60)}h ${economiaMinutos % 60}m`;
                    }
                }
            }
        });

        console.log(`Retornando ${voosRapidos.length} voos rápidos`);
        return resposta;
    } catch (error) {
        console.error('Erro ao buscar voos rápidos:', error);
        return {
            error: 'Erro ao buscar voos rápidos. Por favor, tente novamente mais tarde.',
            results: [],
            voos: []
        };
    }
}

/**
 * Calcula o tempo de espera entre voos em uma conexão
 * @param {Date} partida - Horário de partida
 * @param {Date} chegada - Horário de chegada
 * @returns {string} - Tempo de espera formatado
 */
function calcularTempoEspera(partida, chegada) {
    const diferencaMs = chegada.getTime() - partida.getTime();
    const minutos = Math.round(diferencaMs / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`;
}