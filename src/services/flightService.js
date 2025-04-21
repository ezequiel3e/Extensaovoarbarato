import { config } from '../../config.js';

let tokenCache = {
    token: null,
    expiry: null
};

async function getToken() {
    try {
        console.log('Tentando obter token...');
        if (tokenCache.token && tokenCache.expiry > Date.now()) {
            return tokenCache.token;
        }

        const response = await fetch(config.API.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: config.API.CLIENT_ID,
                client_secret: config.API.CLIENT_SECRET
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) {
                throw new Error('Credenciais inválidas. Por favor, verifique seu CLIENT_ID e CLIENT_SECRET');
            }
            throw new Error(`Falha ao obter token de acesso: ${errorData.error_description || response.statusText}`);
        }

        const data = await response.json();
        tokenCache = {
            token: data.access_token,
            expiry: Date.now() + (data.expires_in * 1000)
        };

        return tokenCache.token;
    } catch (error) {
        console.error('Erro ao obter token:', error);
        throw error;
    }
}

export async function searchFlights({ origem, destino, data }) {
    try {
        const token = await getToken();

        // Formata a data para o padrão YYYY-MM-DD
        const dataFormatada = new Date(data).toISOString().split('T')[0];

        const response = await fetch(`${config.API.BASE_URL}/shopping/flight-offers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currencyCode: "BRL",
                originDestinations: [{
                    id: "1",
                    originLocationCode: origem,
                    destinationLocationCode: destino,
                    departureDateTimeRange: {
                        date: dataFormatada
                    }
                }],
                travelers: [{
                    id: "1",
                    travelerType: "ADULT"
                }],
                sources: ["GDS"],
                searchCriteria: {
                    maxFlightOffers: 10,
                    flightFilters: {
                        cabinRestrictions: [{
                            cabin: "ECONOMY",
                            coverage: "MOST_SEGMENTS",
                            originDestinationIds: ["1"]
                        }]
                    }
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erro na resposta da busca:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(`Falha ao buscar voos: ${errorData.errors?.[0]?.detail || response.statusText}`);
        }

        const responseData = await response.json();

        if (!responseData.data || !Array.isArray(responseData.data)) {
            throw new Error('Formato de resposta inválido da API');
        }

        return responseData.data.map(voo => ({
            origem: voo.itineraries[0].segments[0].departure.iataCode,
            destino: voo.itineraries[0].segments[0].arrival.iataCode,
            partida: voo.itineraries[0].segments[0].departure.at,
            chegada: voo.itineraries[0].segments[0].arrival.at,
            companhia: voo.validatingAirlineCodes[0],
            numeroVoo: voo.itineraries[0].segments[0].number,
            preco: parseFloat(voo.price.total)
        }));
    } catch (error) {
        console.error('Erro na busca de voos:', error);
        throw error;
    }
}