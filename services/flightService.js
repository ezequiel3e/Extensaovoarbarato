import { config } from '../config.js';

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

async function getAccessToken() {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.API.CLIENT_ID);
    params.append('client_secret', config.API.CLIENT_SECRET);

    // Usa as URLs corretas baseadas no ambiente atual
    const apiUrls = getApiUrls();

    try {
        console.log(`Tentando obter token de acesso da API (${useTestEnvironment ? 'TESTE' : 'PRODUÇÃO'}):`,
            apiUrls.TOKEN_URL);

        const response = await fetch(apiUrls.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Falha na resposta da API ao obter token:', errorText);
            throw new Error('Falha ao obter token de acesso');
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000);
        console.log('Token obtido com sucesso, expira em:', new Date(tokenExpiry).toLocaleString());
        return accessToken;
    } catch (error) {
        console.error('Erro detalhado ao obter token:', error);

        // Detectando erro de Content Security Policy
        if (error.message && (
                error.message.includes('Content Security Policy') ||
                error.message.includes('violates the following Content') ||
                error.message.includes('connect-src'))) {
            throw new Error('Erro de permissão: A extensão não está autorizada a se conectar à API. Verifique o manifest.json e reinstale a extensão.');
        }

        throw new Error('Não foi possível autenticar com a API. Verifique sua conexão de internet e tente novamente.');
    }
}

function checkRateLimit() {
    const currentTime = Date.now();
    if (currentTime - lastRequestTime >= config.RATE_LIMIT.TIME_WINDOW) {
        requestCount = 0;
        lastRequestTime = currentTime;
    }

    if (requestCount >= config.RATE_LIMIT.MAX_REQUESTS) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
    }

    requestCount++;
}

// Função para obter nome da companhia aérea
function getAirlineName(airlineCode) {
    const airlines = {
        'LA': 'LATAM',
        'G3': 'GOL',
        'AD': 'Azul',
        'AA': 'American Airlines',
        'Q4': 'Quatro Airlines',
        'DL': 'Delta',
        // Adicione mais companhias aéreas conforme necessário
    };
    return airlines[airlineCode] || airlineCode;
}

// Função para validar parâmetros de busca
function validateSearchParams(params) {
    if (!params.origem || !params.destino) {
        throw new Error('Origem e destino são obrigatórios');
    }

    // Validação adicional para garantir que são códigos IATA válidos
    if (!/^[A-Z]{3}$/.test(params.origem)) {
        throw new Error(`Código de origem inválido: ${params.origem}. Use um código de aeroporto IATA válido (3 letras maiúsculas).`);
    }

    if (!/^[A-Z]{3}$/.test(params.destino)) {
        throw new Error(`Código de destino inválido: ${params.destino}. Use um código de aeroporto IATA válido (3 letras maiúsculas).`);
    }

    // Lista de códigos IATA comuns no Brasil para verificação extra
    const codigosIATABrasileiros = [
        'GRU', 'CGH', 'VCP', 'SDU', 'GIG', 'BSB', 'CNF', 'SSA', 'REC', 'FOR',
        'CWB', 'POA', 'VIX', 'MAO', 'BEL', 'FLN', 'NAT', 'MCZ', 'IGU', 'AJU',
        'SLZ', 'JPA', 'THE', 'CGR', 'CGB', 'PMW', 'PVH', 'RBR', 'BVB', 'MCP',
        'LDB', 'UDI', 'JOI', 'JTC', 'RAO', 'SJP', 'IOS', 'JDO', 'JDF', 'CXJ',
        'PLU', 'GYN', 'IMP', 'JCR'
    ];

    // Aviso para código de origem não encontrado (apenas log, não impede execução)
    if (!codigosIATABrasileiros.includes(params.origem)) {
        console.warn(`Aviso: Código de origem ${params.origem} não está na lista de aeroportos brasileiros comuns`);
    }

    // Aviso para código de destino não encontrado (apenas log, não impede execução)
    if (!codigosIATABrasileiros.includes(params.destino)) {
        console.warn(`Aviso: Código de destino ${params.destino} não está na lista de aeroportos brasileiros comuns`);
    }

    if (!params.data) {
        throw new Error('Data é obrigatória');
    }

    const dataVoo = new Date(params.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataVoo < hoje) {
        throw new Error('A data do voo não pode ser anterior a hoje');
    }

    if (params.origem === params.destino) {
        throw new Error('Origem e destino não podem ser iguais');
    }
}

// Função para processar resultados
function processFlightResults(data) {
    if (!data.data || data.data.length === 0) {
        return [];
    }

    return data.data.map(flight => {
        try {
            const segment = flight.itineraries[0].segments[0];
            const airlineCode = flight.validatingAirlineCodes[0] || segment.carrierCode;

            // Parse das datas
            const partida = new Date(segment.departure.at);
            const chegada = new Date(segment.arrival.at);

            // Calcular duração em minutos
            const duracaoMinutos = Math.floor((chegada - partida) / 60000);
            const horas = Math.floor(duracaoMinutos / 60);
            const minutos = duracaoMinutos % 60;
            const duracaoFormatada = `${horas}h ${minutos}m`;

            return {
                id: flight.id,
                companhia: sanitizeHTML(getAirlineName(airlineCode)),
                codigoCompanhia: airlineCode,
                numeroVoo: sanitizeHTML(segment.number),
                origem: segment.departure.iataCode,
                destino: segment.arrival.iataCode,
                partida: partida.toISOString(),
                chegada: chegada.toISOString(),
                horarioPartida: partida.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                horarioChegada: chegada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                dataPartida: partida.toLocaleDateString('pt-BR'),
                dataChegada: chegada.toLocaleDateString('pt-BR'),
                duracao: duracaoFormatada,
                preco: parseFloat(flight.price.total),
                moeda: flight.price.currency || 'BRL',
                cabine: (flight.travelerPricings && flight.travelerPricings[0] && flight.travelerPricings[0].fareOption) || 'STANDARD'
            };
        } catch (error) {
            console.error('Erro ao processar voo:', error, flight);
            return null;
        }
    }).filter(flight => flight !== null); // Remove resultados com erro
}

// Exportando a função searchFlights
export async function searchFlights(params) {
    try {
        console.log('Iniciando busca de voos com parâmetros:', params);
        validateSearchParams(params);
        checkRateLimit();

        // Tenta até duas vezes, uma em cada ambiente
        let tentativas = 0;
        const maxTentativas = 2;

        while (tentativas < maxTentativas) {
            try {
                tentativas++;
                const token = await getAccessToken();

                // Obter URLs baseadas no ambiente atual
                const apiUrls = getApiUrls();
                const url = new URL(`${apiUrls.BASE_URL}/shopping/flight-offers`);

                url.searchParams.append('originLocationCode', params.origem);
                url.searchParams.append('destinationLocationCode', params.destino);
                url.searchParams.append('departureDate', params.data);
                url.searchParams.append('adults', '1');
                url.searchParams.append('max', '50'); // Aumentando o número de resultados
                url.searchParams.append('currencyCode', 'BRL');
                url.searchParams.append('nonStop', 'true'); // Preferência por voos diretos
                url.searchParams.append('travelClass', 'ECONOMY'); // Classe econômica por padrão

                console.log(`URL da requisição completa (${useTestEnvironment ? 'TESTE' : 'PRODUÇÃO'}):`, url.toString());

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                console.log('Status da resposta:', response.status, response.statusText);

                if (!response.ok) {
                    let errorMessage = `Falha ao buscar voos: ${response.status} ${response.statusText}`;

                    try {
                        const errorText = await response.text();
                        console.error('Resposta da API com erro (texto):', errorText);

                        // Tenta fazer parse do erro como JSON
                        try {
                            const errorJson = JSON.parse(errorText);
                            if (errorJson.errors && errorJson.errors.length > 0) {
                                const errorDetail = errorJson.errors[0].detail || errorJson.errors[0].title || '';
                                errorMessage = `Erro: ${errorDetail || errorMessage}`;
                                console.error('Detalhes do erro JSON:', JSON.stringify(errorJson.errors, null, 2));
                            }
                        } catch (e) {
                            console.error('Erro não é JSON válido');
                        }
                    } catch (e) {
                        console.error('Não foi possível ler o corpo da resposta de erro', e);
                    }

                    throw new Error(errorMessage);
                }

                const responseData = await response.json();
                console.log('Resposta da API completa:', JSON.stringify(responseData, null, 2));

                if (!responseData.data || responseData.data.length === 0) {
                    console.log('Nenhum voo encontrado na resposta da API');
                    return [];
                }

                const resultados = processFlightResults(responseData);

                // Ordenar resultados por preço crescente explicitamente no código
                resultados.sort((a, b) => a.preco - b.preco);

                // Adicionar classificação de preço (melhor preço, preço bom, etc.)
                if (resultados.length > 0) {
                    // Marcar o voo mais barato
                    resultados[0].classificacaoPreco = 'MELHOR_PRECO';

                    // Definir limites para classificações de preço
                    const precoMinimo = resultados[0].preco;

                    // Classificar os demais voos
                    for (let i = 1; i < resultados.length; i++) {
                        const percentualAumento = ((resultados[i].preco - precoMinimo) / precoMinimo) * 100;

                        if (percentualAumento <= 10) {
                            resultados[i].classificacaoPreco = 'PRECO_OTIMO';
                        } else if (percentualAumento <= 25) {
                            resultados[i].classificacaoPreco = 'PRECO_BOM';
                        } else if (percentualAumento <= 50) {
                            resultados[i].classificacaoPreco = 'PRECO_REGULAR';
                        } else {
                            resultados[i].classificacaoPreco = 'PRECO_ALTO';
                        }
                    }
                }

                console.log('Resultados processados e ordenados:', resultados);
                return resultados;

            } catch (error) {
                console.error(`Tentativa ${tentativas} falhou:`, error);

                // Tratamento específico para o erro INVALID OPTION
                if (error.message && error.message.includes('INVALID OPTION')) {
                    console.warn('Detectado erro INVALID OPTION - pode ser um problema com os parâmetros da API');

                    // Se estamos usando parâmetros opcionais que podem estar causando o erro, remova-os
                    if (url && url.searchParams) {
                        // Simplificando a requisição para parâmetros essenciais apenas
                        const urlSimplificada = new URL(`${apiUrls.BASE_URL}/shopping/flight-offers`);
                        urlSimplificada.searchParams.append('originLocationCode', params.origem);
                        urlSimplificada.searchParams.append('destinationLocationCode', params.destino);
                        urlSimplificada.searchParams.append('departureDate', params.data);
                        urlSimplificada.searchParams.append('adults', '1');
                        urlSimplificada.searchParams.append('currencyCode', 'BRL');

                        console.log('Tentando novamente com parâmetros simplificados:', urlSimplificada.toString());

                        // Fazendo a requisição simplificada
                        const responseSimplificada = await fetch(urlSimplificada, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json'
                            }
                        });

                        if (responseSimplificada.ok) {
                            const dadosSimplificados = await responseSimplificada.json();
                            console.log('Resposta com parâmetros simplificados obtida com sucesso');

                            const resultadosSimplificados = processFlightResults(dadosSimplificados);
                            resultadosSimplificados.sort((a, b) => a.preco - b.preco);

                            // Adicionar classificação de preço
                            if (resultadosSimplificados.length > 0) {
                                resultadosSimplificados[0].classificacaoPreco = 'MELHOR_PRECO';

                                const precoMinimo = resultadosSimplificados[0].preco;
                                for (let i = 1; i < resultadosSimplificados.length; i++) {
                                    const percentualAumento = ((resultadosSimplificados[i].preco - precoMinimo) / precoMinimo) * 100;

                                    if (percentualAumento <= 10) {
                                        resultadosSimplificados[i].classificacaoPreco = 'PRECO_OTIMO';
                                    } else if (percentualAumento <= 25) {
                                        resultadosSimplificados[i].classificacaoPreco = 'PRECO_BOM';
                                    } else if (percentualAumento <= 50) {
                                        resultadosSimplificados[i].classificacaoPreco = 'PRECO_REGULAR';
                                    } else {
                                        resultadosSimplificados[i].classificacaoPreco = 'PRECO_ALTO';
                                    }
                                }
                            }

                            console.log('Resultados simplificados processados e ordenados:', resultadosSimplificados);
                            return resultadosSimplificados;
                        }
                    }
                }

                if (tentativas < maxTentativas) {
                    // Se ainda temos tentativas, troca o ambiente e tenta novamente
                    toggleApiEnvironment();
                    console.log(`Tentando novamente com ambiente ${useTestEnvironment ? 'de TESTE' : 'de PRODUÇÃO'}`);
                } else {
                    // Se já tentamos os dois ambientes, propaga o erro
                    throw error;
                }
            }
        }

        // Nunca deve chegar aqui por causa do return ou throw acima
        throw new Error("Erro inesperado na busca de voos");

    } catch (error) {
        console.error('Erro detalhado na busca de voos:', error);
        throw error;
    }
}