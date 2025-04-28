// Rota para testar conexão com a API Amadeus
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async(req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Responder a requisições OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Responder a requisições GET
    if (req.method === 'GET') {
        try {
            // Verificar as variáveis de ambiente disponíveis
            // Tentaremos os dois formatos possíveis para as credenciais
            const clientId = process.env.AMADEUS_CLIENT_ID || process.env.ID_DO_CLIENTE_AMADEUS;
            const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

            // Retornar as informações das variáveis (sem expor o valor completo das senhas)
            const envInfo = {
                clientIdExists: !!clientId,
                clientIdName: clientId ? 'Definido como ' + (process.env.AMADEUS_CLIENT_ID ? 'AMADEUS_CLIENT_ID' : 'ID_DO_CLIENTE_AMADEUS') : 'Não encontrado',
                clientSecretExists: !!clientSecret,
                clientSecretFirstChars: clientSecret ? clientSecret.substring(0, 3) + '...' : 'Não disponível',
                allEnvKeys: Object.keys(process.env)
            };

            if (!clientId || !clientSecret) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Credenciais da Amadeus não configuradas corretamente',
                    envInfo
                });
            }

            // Tentar obter um token da Amadeus para confirmar que as credenciais estão funcionando
            const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
            });

            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                return res.status(tokenResponse.status).json({
                    status: 'error',
                    message: 'Falha na autenticação com a Amadeus',
                    details: errorText,
                    envInfo
                });
            }

            const tokenData = await tokenResponse.json();

            // Retornar informações sobre o token (ocultando o token real)
            return res.status(200).json({
                status: 'success',
                message: 'Conexão com a API Amadeus estabelecida com sucesso',
                tokenInfo: {
                    tokenType: tokenData.token_type,
                    expiresIn: tokenData.expires_in,
                    tokenFirstChars: tokenData.access_token.substring(0, 10) + '...'
                },
                timestamp: new Date().toISOString(),
                envInfo
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Erro ao testar conexão com a Amadeus',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    } else {
        // Método não suportado
        return res.status(405).json({
            error: 'Método não permitido',
            message: `O método ${req.method} não é suportado nesta rota`,
            allowedMethods: ['GET', 'OPTIONS']
        });
    }
};