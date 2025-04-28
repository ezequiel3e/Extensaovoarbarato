// Rota simples para teste de conexão com o backend
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
        return res.status(200).json({
            status: 'online',
            message: 'API está funcionando corretamente',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        });
    } else {
        // Método não suportado
        return res.status(405).json({
            error: 'Método não permitido',
            message: `O método ${req.method} não é suportado nesta rota`,
            allowedMethods: ['GET', 'OPTIONS']
        });
    }
};