/* eslint-disable no-unused-vars */
const { TextChannel, Message } = require("discord.js");
const { Queue, Song } = require("distube");
/* eslint-enable no-unused-vars  */

/**
 * Traduz as permissões
 * @param {String[]} perms Permissões para traduzir
 * @returns {String[]} Permissões traduzidas
 */
exports.traduzirPerms = (perms) => {
  let listaPerms = [];

  perms.forEach(perm => {
    if (perm in client.defs.permissoes) {
      listaPerms.push(client.defs.permissoes[perm]);
    } else {
      client.log("aviso", `Permissão ${perm} não encontrada na lista`);
      listaPerms.push(perm.toString());
    }
  });

  return listaPerms;
};

/**
 * Formata o nome do canal
 * @param {TextChannel} canal Canal ter o nome formatado
 * @returns {String} Nome formatado
 */
exports.formatarCanal = (canal) => {
  if (typeof canal === TextChannel) throw new Error("Isso não é um canal");

  return canal.type === "DM" ? "DM" : (canal.name.includes("│") ? canal.name.split("│")[1] : canal.name);
};

/**
 * Dar fetch em todas as mensagens do canal
 * @param {TextChannel} canal
 * @param {Object} opcoes
 * @param {Number} opcoes.limiteReq Limite de requests
 * @param {Number} opcoes.limiteMsg Limite de mensagens
 * @param {Boolean} opcoes.invertido Receber a lista invertida
 * @param {Boolean} opcoes.apenasUsuario Receber apenas as mensagens de usuário
 * @param {Boolean} opcoes.apenasBot Receber apenas as mensagens de bots
 * @param {Boolean} opcoes.fixados Receber apenas as mensagens fixadas
 * @returns {Message[]} Mensagens recebidas
 */
exports.fetchAll = async (
  canal,
  opcoes = {
    limiteReq: 10,
    limiteMsg: 100,
    invertido: false,
    apenasUsuario: false,
    apenasBot: false,
    fixados: false
  }
) => {
  const inicio = new Date();

  // eslint-disable-next-line no-promise-executor-return
  const delay = async (ms) => new Promise(res => setTimeout(res, ms));
  const {
    limiteReq: limite,
    limiteMsg: msgLimite, invertido, apenasUsuario, apenasBot, fixados
  } = opcoes;
  let mensagens = [];
  let ultimoId = null;

  /**
   * Finalizar fetchAll
   * @param {Message[]} mensagens Mensagens recebidas
   * @param {String} razao Razão para finalizar o fetch
   * @returns {Message[]} Mensagens recebidas
   */
  const finalizar = (mensagens, razao) => {
    if (invertido) mensagens.reverse();
    if (apenasUsuario) mensagens.filter(m => !m.author.bot);
    if (apenasBot) mensagens.filter(m => m.author.bot);
    if (fixados) mensagens.filter(m => m.pinned);

    client.log(
      "verbose",
      `O fetchAll foi finalizado em ${new Date().getTime() - inicio.getTime()}ms pois ${razao} `
      + `e recebeu ${mensagens.length} mensagens`
    );
    return mensagens;
  };

  for (var i = 1; true; ++i) {
    const mensagensRecebidas = await canal.messages.fetch({
      limit: msgLimite,
      cache: false,
      ...(ultimoId && { before: ultimoId })
    });

    //* Caso não receba nenhum outra msg ou atinja
    if (mensagensRecebidas.size === 0) return finalizar(mensagens, "acabou as mensagens");

    //* Adicionar as mensagens recebidas
    mensagens = mensagens.concat(Array.from(mensagensRecebidas.values()));
    ultimoId = mensagensRecebidas.lastKey();

    //* Caso atinja o limite
    if (i === limite) return finalizar(mensagens, "atingiu o limite");

    client.log("verbose", `${mensagens.length} mensagens ${i}/${limite} requests`);

    //* Pro discord não comer meu cu
    if (i % 5 === 0) client.log("verbose", "Esperando para não dar rate limit..."), await delay(5000);
  }
};

/**
 * Calcular a data do próximo aniversário
 * @param {Date} nascimentoData 
 * @returns {Date} Próximo aniversário
 */
exports.proximoAniversario = (nascimentoData) => {
  const hoje = new Date();
  nascimentoData.setYear(hoje.getFullYear());

  if (nascimentoData.getTime() <= hoje.getTime()) {
    nascimentoData.setYear(hoje.getFullYear() + 1);
  }

  return nascimentoData;
};

/**
 * Capitaliza o texto
 * @param {String} texto Texto para ser capitalizado
 * @returns {String} Texto capitalizado
 */
exports.capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Formata um ID para mencionar o usuário
 * @param {String|String[]} ids 
 * @returns 
 */
exports.criarMencoes = (ids) => {
  if (typeof ids === "string") return `<@${ids}>`;
  if (!(ids instanceof Array)) throw new Error("Parametro \"ids\" não é uma String nem Array");

  let mencoes = [];
  for (const mencao of ids) {
    mencoes.push(`<@${mencao}>`);
  }
  return mencoes;
};

/**
 * Cria timestamps para o discord
 * @param {Date} data Data para o timestamp
 * @param {"f"|"F"|"R"|"d"|"D"|"t"|"T"} formato 
 * @returns 
 */
exports.criarTimestamp = (data, formato) => {
  return `<t:${Math.round(data.getTime() / 1000)}:${formato}>`;
};

/**
 * Cria uma barra de progresso
 * @param {Number} porcentagem Porcentagem para o progresso
 * @param {Object} opcoesBarra
 * @param {String} opcoes.indicador Indicador da barra
 * @param {String} opcoes.linha A linha de progresso da barra
 * @param {Number} opcoes.tamanho Tamanho da barra
 * @returns 
 */
exports.criarBarraProgresso = (
  porcentagem = 0,
  opcoesBarra = { indicador: "🔘", linha: "▬", tamanho: 10 }
) => {
  const { indicador, linha, tamanho } = opcoesBarra;

  const posicao = Math.round(porcentagem * tamanho);

  // Colocar indicardor no início se a posição foi negativa
  if (posicao <= 0) return `${indicador}${linha.repeat(tamanho - 1)}`;

  // Colocar indicador no final se a posição for maior que o limite
  if (posicao >= tamanho) return `${linha.repeat(tamanho - 1)}${indicador}`;

  // Colocar indicador
  const barra = linha.repeat(tamanho - 1).split("");
  barra.splice(posicao, 0, indicador);
  return barra.join("");
};

/**
 * Posição da música na fila e tamanho da fila
 * @typedef {Object} Posicao
 * @property {number} posicaoMusica
 * @property {number} tamanhoFila
 */

/**
 * Encontra a posição da música na fila e tamanho dela
 * @param {Queue} filaMusicas Lista de músicas
 * @param {Song} musica Música para ser encontrada
 * @returns {Posicao} A posição da música na fila e tamanho dela
 * @throws {Error} Se `id` da música não for definida
 */
exports.encontrarPosicao = (filaMusicas, musica) => {
  if (!(filaMusicas instanceof Queue)) throw new TypeError("listaMusica precisa ser Queue");
  if (!(musica instanceof Song)) throw new TypeError("musica precisa ser Song");
  if (!musica.metadata?.id) throw new Error("Música recebida não tem id definido");

  const musicasAnte = filaMusicas.previousSongs;
  const musicasProx = filaMusicas.songs;

  const listaCompleta = musicasAnte.concat(musicasProx);
  const posicaoMusica = listaCompleta.findIndex(m => {
    return m.name === musica.name && m.metadata.id === musica.metadata.id;
  }) + 1;

  return {
    posicaoMusica,
    tamanhoFila: musicasAnte.length + musicasProx.length
  };
};