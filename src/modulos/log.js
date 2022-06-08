/* eslint-disable max-len */
const chalk = require("chalk");

/**
 * 
 * @param {"bot"|"mongodb"|"critico"|"erro"|"aviso"|"comando"|"meme"|"servidor"|"info"|"api"|"musica"|"verbose"|"log"|"custom"} tipo O tipo de log
 * @param {string} msg Mensagem para logar
 * @param {"critico"|"erro"|"aviso"} subtipo 
 * @param {boolean} semTempo se deve logar com tempo ou sem
 * @returns
 */
module.exports = (tipo, msg, subtipo, semTempo) => {
  const tempo = new Date();
  const logTempo = semTempo ? "" : chalk.keyword("dimgray")`[${tempo.toLocaleTimeString()}.${String(tempo.getMilliseconds()).padStart(3, "0")}] `;
  //if (!client.config.get("log", tipo !== null ? tipo : "normal")) return;

  const subTipo = (subtipo) => {
    switch (subtipo) {
      case "critico": // Erros não pegos
        return chalk` {keyword('red') crt}`;

      case "erro": // Erros normais
        return chalk` {keyword('maroon') err}`;

      case "aviso": // Avisos não nocivos a funcionalidade do bot
        return chalk` {keyword('gold') avs}`;

      default:
        return "";
    }
  };

  switch (tipo) {
    // Tudo relacionado ao bot
    case "bot":
      return console.log(chalk`${logTempo}{bgKeyword('white').black BOT}${subTipo(subtipo)} {keyword('white') ${msg}}`);

    // Tudo relacionado ao bot
    case "mongodb":
      return console.log(chalk`${logTempo}{bgHex("#4db33d").black MONGODB}${subTipo(subtipo)} {hex("#4db33d") ${msg}}`);

    // Erros não pegos
    case "critico":
      return console.error(chalk`${logTempo}{bgKeyword('red').black CRITICO}${subTipo(subtipo)} {keyword('red') ${msg}}`);

    // Erros normais
    case "erro":
      return console.error(chalk`${logTempo}{bgKeyword('maroon').black ERRO}${subTipo(subtipo)} {keyword('maroon') ${msg}}`);

    // Avisos não nocivos a funcionalidade do bot
    case "aviso":
      return console.warn(chalk`${logTempo}{bgKeyword('gold').black AVISO}${subTipo(subtipo)} {keyword('gold') ${msg}}`);

    // Ativadores de um comando
    case "comando":
      return console.log(chalk`${logTempo}{bgKeyword('mediumseagreen').black COMANDO}${subTipo(subtipo)} {keyword('mediumseagreen') ${msg}}`);

    // Ativadores de um comando
    case "meme":
      return console.log(chalk`${logTempo}{bgKeyword('mediumaquamarine').black MEME}${subTipo(subtipo)} {keyword('mediumaquamarine') ${msg}}`);

    // Avisos sobre eventos do servidor
    case "servidor":
      return console.log(chalk`${logTempo}{bgKeyword('darkcyan').black SERVIDOR}${subTipo(subtipo)} {keyword('darkcyan') ${msg}}`);

    // Informações adicionais
    case "info":
      return console.log(chalk`${logTempo}{bgKeyword('cornflowerblue').black INFO}${subTipo(subtipo)} {keyword('cornflowerblue') ${msg}}`);

    // Tudo sobre a conexão com uma api
    case "api":
      return console.log(chalk`${logTempo}{bgHex("#5865f2").black API}${subTipo(subtipo)} {hex("#5865f2") ${msg}}`);

    case "musica":
      return console.log(chalk`${logTempo}{bgKeyword('darkcyan').black MUSICA}${subTipo(subtipo)} {keyword('darkcyan') ${msg}}`);

    // Informações adicionais so que SPAM
    case "verbose":
      return console.log(chalk`${logTempo}{bgKeyword('mediumpurple').black VERBOSE}${subTipo(subtipo)} {keyword('mediumpurple') ${msg}}`);

    // Log
    case "log":
      return console.log(chalk`${logTempo}{keyword('white')${subTipo(subtipo)} ${msg}}`);

    // Log customizável
    case "custom":
      return console.log(`${logTempo} ${chalk(msg)}`);

    default:
      return console.log(chalk`${logTempo}{keyword('dimgray')${subTipo(subtipo)} ${msg}}`);
  }
};

// module.exports("custom", chalk`{bgKeyword('lime').black PASS} {keyword('silver') teste foda}`);
// module.exports("custom", chalk`{bgKeyword('red').black FAIL} {keyword('silver') teste foda}`);
// module.exports("custom", chalk`Testes: {keyword('red') 1 falharam}, {keyword('lime') 1 passaram}, 2 total`);
// module.exports("custom", chalk`Resultado: {bgKeyword('red').black FAIL}`);
// module.exports("custom", chalk`Resultado: {bgKeyword('lime').black PASS}`);

// module.exports("log", "Teste foda")
// module.exports(null, "Teste foda")
// module.exports("bot", "Teste foda")
// module.exports("bot", "Teste foda", "critico")
// module.exports("critico", "Teste foda")
// module.exports("erro", "Teste foda")
// module.exports("aviso", "Teste foda")
// module.exports("comando", "Teste foda")
// module.exports("comando", "Teste foda", "erro")
// module.exports("servidor", "Teste foda")
// module.exports("verbose", "Teste foda")
// module.exports("info", "Teste foda")
// module.exports("info", "Teste foda", "aviso")
// module.exports("api", "Teste foda")
