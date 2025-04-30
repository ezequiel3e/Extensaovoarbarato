# Voo Barato

Aplicação para busca de voos com os melhores preços, utilizando a API Amadeus.

## Funcionalidades

- Busca de voos com origem e destino
- Sugestões de aeroportos durante a digitação
- Opção de busca flexível para encontrar as melhores tarifas
- Visualização dos resultados em formato de cartões
- Integração com sites de companhias aéreas para reserva

## Estrutura do Projeto

```
.
├── index.html            # Página principal
├── styles.css            # Estilos CSS
├── init.js               # Script de inicialização
├── fixSearchFlights.js   # Garantia de disponibilidade da função de busca
├── fixSugestoes.js       # Funcionalidade de sugestões
├── fixBusca.js           # Funcionalidade de busca
├── load-modules.js       # Carregador de módulos assíncrono
├── src/
│   ├── controllers/      # Controladores da aplicação
│   │   └── buscaController.js  # Controlador de busca
│   ├── services/         # Serviços da aplicação
│   │   └── flightService.js    # Serviço de busca de voos
│   └── utils/            # Utilitários
│       ├── validacao.js       # Validação de entradas
│       ├── sugestoes.js       # Gerenciamento de sugestões
│       └── flightDisplay.js   # Exibição de resultados
└── data/                 # Dados estáticos
    └── aeroportos.js     # Lista de aeroportos
```

## Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` no seu navegador
3. Ou utilize um servidor local, como Live Server do VSCode

## Desenvolvimento

Para desenvolvimento, recomenda-se:

1. Instalar dependências: `npm install`
2. Iniciar servidor de desenvolvimento: `npm run dev`
3. Construir para produção: `npm run build`

## Tecnologias Utilizadas

- JavaScript puro (Vanilla JS)
- HTML5 e CSS3
- API Amadeus para busca de voos
- Módulos ES6
- Design responsivo

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

# Backend Proxy Seguro para Amadeus

Este backend serve como intermediário seguro entre sua extensão/front-end e a API da Amadeus, protegendo suas credenciais.

## Como usar

1. **Clone este repositório e acesse a pasta:**
   ```sh
   git clone <seu-repo>
   cd <pasta-do-backend>
   ```

2. **Crie um arquivo `.env` com suas credenciais de produção da Amadeus:**
   ```env
   AMADEUS_CLIENT_ID=SEU_CLIENT_ID_AQUI
   AMADEUS_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
   PORT=3001
   ```

3. **Instale as dependências:**
   ```sh
   npm install
   ```

4. **Inicie o servidor:**
   ```sh
   npm start
   ```

5. **No seu front-end/extensão, faça requisições para:**
   ```
   POST http://<seu-backend>/api/flights
   Body (JSON):
   {
     "origin": "GRU",
     "destination": "REC",
     "date": "2024-07-01"
   }
   ```

## Segurança
- Suas credenciais NUNCA ficam expostas no front-end.
- O backend pode ser hospedado em Vercel, Render, Heroku, AWS, etc.

## Observações
- Adapte o endpoint conforme sua necessidade.
- Para produção, use HTTPS.

## Configuração

2. **Configuração das variáveis de ambiente:**

**IMPORTANTE: Nunca coloque credenciais no código-fonte ou no repositório!**

As credenciais da API Amadeus devem ser configuradas APENAS no painel de variáveis de ambiente do Vercel ou em arquivos .env locais que NÃO são versionados.

O frontend (extensão Chrome) nunca faz chamadas diretas para a API Amadeus. Todas as chamadas que necessitam de autenticação são feitas através do backend seguro no Vercel. 