import { searchFlights } from './flightService.js';


/**
 * Busca as melhores promoções para um trajeto (origem-destino) em um intervalo de datas
 * @param {string} origem - Código IATA do aeroporto de origem
 * @param {string} destino - Código IATA do aeroporto de destino
 * @param {Date} dataInicial - Data inicial para buscar voos (opcional)
 * @param {Date} dataFinal - Data final para buscar voos (opcional)
 * @returns {Promise<Array>} Lista de voos encontrados ordenados por preço
 */
export async function buscarMelhoresPromocoes(origem, destino, dataInicial, dataFinal) {
    try {
        // Se não tiver datas definidas, usar próximos 30 dias
        if (!dataInicial) {
            dataInicial = new Date();
        }

        if (!dataFinal) {
            dataFinal = new Date();
            dataFinal.setDate(dataFinal.getDate() + 30);
        }

        console.log(`Buscando melhores promoções de ${origem} para ${destino} entre ${dataInicial.toLocaleDateString()} e ${dataFinal.toLocaleDateString()}`);

        // Array para armazenar resultados de todas as datas
        const todosVoos = [];

        // Número máximo de dias para buscar (limite para não sobrecarregar a API)
        const MAX_DIAS = 5;

        // Calcular intervalo entre as datas para distribuir as buscas
        const diffTime = Math.abs(dataFinal - dataInicial);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Determinar o intervalo para fazer as buscas
        const intervalo = Math.max(1, Math.floor(diffDays / MAX_DIAS));

        // Array de promessas para fazer buscas em paralelo
        const promessas = [];

        // Fazer busca em datas distribuídas no intervalo
        let dataAtual = new Date(dataInicial);
        let contador = 0;

        while (dataAtual <= dataFinal && contador < MAX_DIAS) {
            const dataFormatada = dataAtual.toISOString().split('T')[0];

            // Adicionar busca à lista de promessas
            promessas.push(
                searchFlights({
                    origin: origem,
                    destination: destino,
                    date: dataFormatada
                }).then(voos => {
                    console.log(`Encontrados ${voos.length} voos para ${dataFormatada}`);
                    return voos;
                }).catch(erro => {
                    console.error(`Erro ao buscar voos para ${dataFormatada}:`, erro);
                    return []; // Retorna array vazio em caso de erro
                })
            );

            // Avançar para próxima data
            dataAtual.setDate(dataAtual.getDate() + intervalo);
            contador++;
        }

        // Aguardar todas as buscas concluírem
        console.log(`Realizando ${promessas.length} buscas em paralelo...`);
        const resultados = await Promise.all(promessas);

        // Juntar todos os resultados
        resultados.forEach(voos => {
            if (voos && voos.length > 0) {
                todosVoos.push(...voos);
            }
        });

        // Ordenar por preço
        todosVoos.sort((a, b) => a.preco - b.preco);

        // Adicionar indicador de melhor preço para os 3 primeiros
        if (todosVoos.length > 0) {
            todosVoos[0].classificacaoPreco = 'MELHOR_PRECO';

            // Adicionar classificação para os próximos
            const precoMinimo = todosVoos[0].preco;

            for (let i = 1; i < todosVoos.length; i++) {
                const percentualAumento = ((todosVoos[i].preco - precoMinimo) / precoMinimo) * 100;

                if (percentualAumento <= 5) {
                    todosVoos[i].classificacaoPreco = 'PRECO_OTIMO';
                } else if (percentualAumento <= 15) {
                    todosVoos[i].classificacaoPreco = 'PRECO_BOM';
                } else if (percentualAumento <= 30) {
                    todosVoos[i].classificacaoPreco = 'PRECO_REGULAR';
                } else {
                    todosVoos[i].classificacaoPreco = 'PRECO_ALTO';
                }
            }
        }

        console.log(`Encontrados ${todosVoos.length} voos no total. Melhor preço: ${todosVoos.length > 0 ? todosVoos[0].preco : 'N/A'}`);
        return todosVoos;
    } catch (erro) {
        console.error('Erro na busca de melhores promoções:', erro);
        throw erro;
    }
}