/**
 * Serviço para redirecionamento ao site das companhias aéreas com dados pré-preenchidos
 */

// Mapeamento do código da companhia para o domínio do site
const AIRLINE_DOMAINS = {
    'LA': 'latamairlines.com', // LATAM
    'G3': 'voegol.com.br', // GOL
    'AD': 'voeazul.com.br', // Azul
    'AA': 'aa.com', // American Airlines
    'DL': 'delta.com', // Delta
    'CM': 'copaair.com', // Copa Airlines
    'TP': 'flytap.com', // TAP Portugal
    'UA': 'united.com', // United Airlines
    'AV': 'avianca.com', // Avianca
    'EK': 'emirates.com' // Emirates
};

// Mapeamento dos códigos das companhias para seus nomes completos
const AIRLINE_NAMES = {
    'LA': 'LATAM',
    'G3': 'GOL',
    'AD': 'Azul',
    'AA': 'American Airlines',
    'DL': 'Delta',
    'CM': 'Copa Airlines',
    'TP': 'TAP Portugal',
    'UA': 'United Airlines',
    'AV': 'Avianca',
    'EK': 'Emirates'
};

/**
 * Extrai o código IATA da companhia a partir do nome completo
 * @param {string} airlineName - Nome completo da companhia (ex: "LATAM")
 * @returns {string|null} - Código IATA ou null se não encontrado
 */
function getAirlineCodeFromName(airlineName) {
    for (const [code, name] of Object.entries(AIRLINE_NAMES)) {
        if (name === airlineName) {
            return code;
        }
    }
    return null;
}

/**
 * Formata a data para o formato aceito pela companhia aérea
 * @param {string} dateStr - Data no formato ISO (YYYY-MM-DD)
 * @returns {Object} - Objeto com a data formatada em diferentes padrões
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);

    return {
        iso: dateStr, // YYYY-MM-DD
        ddmmyyyy: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`,
        mmddyyyy: `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`,
        day: date.getDate().toString().padStart(2, '0'),
        month: (date.getMonth() + 1).toString().padStart(2, '0'),
        year: date.getFullYear().toString()
    };
}

/**
 * Constrói a URL para redirecionamento ao site da LATAM
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildLatamUrl(flightData) {
    const dates = formatDate(flightData.data);
    const baseUrl = 'https://www.latamairlines.com/br/pt/';

    // A LATAM aceita o formato ISO (YYYY-MM-DD) para as datas
    return `${baseUrl}booking/buscar-voos?origin=${flightData.origem}&destination=${flightData.destino}&outbound=${dates.iso}&inbound=&adt=1&chd=0&inf=0&trip=OW&cabin=Economy&redemption=false`;
}

/**
 * Constrói a URL para redirecionamento ao site da GOL
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildGolUrl(flightData) {
    const dates = formatDate(flightData.data);
    // A GOL usa o formato DD/MM/YYYY para datas, separados por /
    return `https://compras.voegol.com.br/Select2.aspx?s=true&o=${flightData.origem}&d=${flightData.destino}&dt1=${dates.day}/${dates.month}/${dates.year}&dt2=&r=false&ada=1&chd=0&inf=0`;
}

/**
 * Constrói a URL para redirecionamento ao site da Azul
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildAzulUrl(flightData) {
    const dates = formatDate(flightData.data);
    // Azul usa o formato YYYY-MM-DD para as datas
    return `https://viaje.voeazul.com.br/search/${flightData.origem}/${flightData.destino}/${dates.iso}/1/0/0/Economy/BRL`;
}

/**
 * Constrói a URL para redirecionamento ao site da American Airlines
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildAmericanUrl(flightData) {
    const dates = formatDate(flightData.data);
    // American Airlines usa o formato YYYY-MM-DD
    return `https://www.aa.com/booking/find-flights?tripType=oneWay&numberOfAdults=1&cabinType=Economy&origin=${flightData.origem}&destination=${flightData.destino}&departureDate=${dates.iso}`;
}

/**
 * Constrói a URL para redirecionamento ao site da Delta
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildDeltaUrl(flightData) {
    const dates = formatDate(flightData.data);
    // Delta usa MM/DD/YYYY para datas
    return `https://www.delta.com/flight-search/book-a-flight?cacheKeySuffix=ecb97b01-d18d-4d47-9f43-c82d30053262&tripType=ONE_WAY&priceSchedule=REV&destinationAirportRadius=No+Preference&returnAirportRadius=No+Preference&originAirportCode=${flightData.origem}&originAirportRadiusValue=0&destinationAirportCode=${flightData.destino}&destinationAirportRadiusValue=0&departureDate=${dates.month}%2F${dates.day}%2F${dates.year}&departureTime=AT&adultPassengerCount=1&childPassengerCount=0&infantPassengerCount=0&fareType=BE&meetingEventCode=&refundableFlightsOnly=false&nonstopFlightsOnly=false&datesFlexible=false&myDatesFlexible=false&myFlexibleCalendar=false&cabinFareClass=BE`;
}

/**
 * Constrói a URL para redirecionamento ao site da United
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildUnitedUrl(flightData) {
    const dates = formatDate(flightData.data);
    // United usa o formato ISO YYYY-MM-DD
    return `https://www.united.com/en/us/book-travel/flights/search?f=${flightData.origem}&t=${flightData.destino}&d=${dates.iso}&tt=1&at=1&ct=1&sc=1&px=1&taxng=1&newHP=True`;
}

/**
 * Constrói a URL para redirecionamento ao site da TAP Portugal
 * @param {Object} flightData - Dados do voo
 * @returns {string} - URL para redirecionamento
 */
function buildTAPUrl(flightData) {
    const dates = formatDate(flightData.data);
    // TAP usa o formato YYYY-MM-DD
    return `https://booking.flytap.com/booking/flights?type=0&adults=1&children=0&infants=0&from=${flightData.origem}&to=${flightData.destino}&departure=${dates.iso}&return=&cabinClass=Economy&currency=BRL&market=BR`;
}

/**
 * Função genérica para redirecionar para o site da companhia
 * @param {Object} flightData - Dados do voo (origem, destino, data, companhia)
 * @param {Object} passengerData - Dados do passageiro (nome, documento, email, telefone)
 * @returns {string} - URL completa para o site da companhia com dados pré-preenchidos
 */
export function getAirlineRedirectUrl(flightData, passengerData = null) {
    try {
        console.log("Redirecionando para companhia:", flightData.companhia);
        console.log("Dados do passageiro:", passengerData);

        // Extrai o código da companhia se estiver usando o nome completo
        let airlineCode = getAirlineCodeFromName(flightData.companhia);

        // Se não encontrou via nome, pode ser que já estamos recebendo o código diretamente
        if (!airlineCode && flightData.airlineCode) {
            airlineCode = flightData.airlineCode;
        }

        // Se ainda não temos o código, verificamos pelos domínios
        if (!airlineCode) {
            for (const [code, name] of Object.entries(AIRLINE_NAMES)) {
                if (flightData.companhia && flightData.companhia.includes(name)) {
                    airlineCode = code;
                    break;
                }
            }
        }

        // Se ainda não temos um código, verificamos por correspondência parcial
        if (!airlineCode && flightData.companhia) {
            const companhiaUpperCase = flightData.companhia.toUpperCase();
            if (companhiaUpperCase.includes('LATAM')) {
                airlineCode = 'LA';
            } else if (companhiaUpperCase.includes('GOL')) {
                airlineCode = 'G3';
            } else if (companhiaUpperCase.includes('AZUL')) {
                airlineCode = 'AD';
            } else if (companhiaUpperCase.includes('AMERICAN')) {
                airlineCode = 'AA';
            } else if (companhiaUpperCase.includes('DELTA')) {
                airlineCode = 'DL';
            } else if (companhiaUpperCase.includes('UNITED')) {
                airlineCode = 'UA';
            } else if (companhiaUpperCase.includes('TAP')) {
                airlineCode = 'TP';
            }
        }

        // Se ainda não temos um código, devolve um URL genérico para o Google
        if (!airlineCode) {
            console.warn(`Companhia aérea não reconhecida: ${flightData.companhia}. Redirecionando para busca genérica.`);
            return `https://www.google.com/search?q=passagens+aereas+${flightData.origem}+para+${flightData.destino}`;
        }

        console.log("Código da companhia identificado:", airlineCode);

        // De acordo com a companhia aérea, construa a URL apropriada
        let url;
        switch (airlineCode) {
            case 'LA': // LATAM
                url = buildLatamUrl(flightData);
                break;
            case 'G3': // GOL
                url = buildGolUrl(flightData);
                break;
            case 'AD': // Azul
                url = buildAzulUrl(flightData);
                break;
            case 'AA': // American Airlines
                url = buildAmericanUrl(flightData);
                break;
            case 'DL': // Delta
                url = buildDeltaUrl(flightData);
                break;
            case 'UA': // United
                url = buildUnitedUrl(flightData);
                break;
            case 'TP': // TAP Portugal
                url = buildTAPUrl(flightData);
                break;
            default:
                console.log(`URL específica para ${AIRLINE_NAMES[airlineCode]} não implementada. Redirecionando para site principal.`);
                const domain = AIRLINE_DOMAINS[airlineCode] || 'google.com';
                url = `https://www.${domain}`;
        }

        console.log("URL de redirecionamento gerada:", url);
        return url;
    } catch (error) {
        console.error("Erro ao gerar URL para redirecionamento:", error);
        return null;
    }
}