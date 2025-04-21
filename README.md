# VoaBarato - Extensão Chrome para Busca de Passagens

Uma extensão Chrome simples para buscar preços de passagens aéreas usando APIs gratuitas.

## Configuração

1. Registre-se no [Aviation Stack](https://aviationstack.com/) para obter uma chave de API gratuita
2. Abra o arquivo `popup.js` e substitua `SUA_API_KEY_AQUI` pela sua chave de API

## Instalação

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" no canto superior direito
3. Clique em "Carregar sem compactação" e selecione a pasta da extensão

## Como Usar

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Digite o código do aeroporto de origem (ex: GRU, BSB)
3. Digite o código do aeroporto de destino (ex: JFK, MIA)
4. Selecione a data desejada
5. Clique em "Buscar Voos"

## Limitações do MVP

- Usa a API gratuita do Aviation Stack (limitada a 100 requisições por mês)
- Preços são simulados (API gratuita não fornece preços reais)
- Busca apenas voos diretos
- Não inclui filtros avançados

## Próximos Passos

- Integrar APIs com preços reais
- Adicionar busca de voos com conexões
- Implementar filtros (preço, horário, companhia)
- Adicionar sistema de alertas de preços
- Melhorar a interface do usuário

## Contribuição

Sinta-se à vontade para contribuir com o projeto! Abra uma issue ou envie um pull request. 