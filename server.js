require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());

// Configurar CORS para permitir requisições da extensão
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Responder imediatamente a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Usar o middleware CORS também para maior compatibilidade
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.json({ message: 'Servidor Voo Barato funcionando!' });
});

const AMADEUS_CLIENT_ID = process.env.ID_DO_CLIENTE_AMADEUS;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE_URL = process.env.URL_BASE_AMADEUS || 'https://api.amadeus.com/v2';
const AMADEUS_TOKEN_URL = process.env.URL_TOKEN_AMADEUS || 'https://api.amadeus.com/v1/security/oauth2/token';

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('client_id', AMADEUS_CLIENT_ID);
    data.append('client_secret', AMADEUS_CLIENT_SECRET);

    const response = await fetch(AMADEUS_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error('Erro ao obter token: ' + error);
    }
    const json = await response.json();
    accessToken = json.access_token;
    tokenExpiry = Date.now() + (json.expires_in * 1000) - 60000;
    return accessToken;
}

// Rota para testar se o servidor está funcionando
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor Voo Barato está funcionando!' });
});

// Rota principal para busca de voos
app.post('/api/flights', async(req, res) => {
    try {
        const { origin, destination, date, adults = 1, cabinClass = 'ECONOMY' } = req.body;
        if (!origin || !destination || !date) {
            return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
        }

        console.log('Recebida requisição para buscar voos:', { origin, destination, date });

        const token = await getAccessToken();
        const url = `${AMADEUS_BASE_URL}/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=${adults}&travelClass=${cabinClass}&currencyCode=BRL&max=20`;

        console.log('Enviando requisição para Amadeus:', url);

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Erro na resposta da Amadeus:', error);
            return res.status(500).json({ error: 'Erro na busca de voos', details: error });
        }

        const data = await response.json();
        console.log('Resposta recebida da Amadeus, total de voos:', data.data ? data.data.length : 0);

        res.json(data);
    } catch (err) {
        console.error('Erro ao processar requisição:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});