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

MIT 