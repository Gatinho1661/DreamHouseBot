const fg = require("fast-glob");

module.exports.carregar = () => {
  const listaComandos = [];

  for (const arquivo of fg.sync("*.js", { cwd: client.dir + "/comandos", baseNameMatch: true })) {
    const pasta = arquivo.split("/")[0];

    try {
      const comando = require(client.dir + `/comandos/${arquivo}`);

      //* Verificar se já existe um comando com esse nome
      if (client.comandos.some(cmd => cmd.sinonimos.includes(comando.nome))) {
        throw new Error(`O nome "${comando.nome}" já está registrado como um sinônimo de um comando`);
      }
      if (client.comandos.some(cmd => cmd.nome === comando.nome)) {
        throw new Error(`Um comando com o nome "${comando.nome}" já está registrado`);
      }

      //* Verificar se já existe algum sinônimo
      for (const sinonimo of comando.sinonimos) {
        if (client.comandos.some(cmd => cmd.sinonimos.includes(sinonimo))) {
          throw new Error(`Um comando com o sinônimo "${sinonimo}" já está registrado`);
        }
        if (client.comandos.some(cmd => cmd.nome === sinonimo)) {
          throw new Error(`O sinônimo "${sinonimo}" já está registrado como o nome de um comando`);
        }
      }

      //* Verificar se o comando é suportado
      if (typeof comando.suporteBarra === "undefined") {
        client.log("aviso", `Nível de suporte não definido em ${comando.nome}`);
      }

      //* Definir a categoria do comando
      if (client.defs.categorias[pasta]) {
        comando.categoria = pasta;
        comando.escondido = client.defs.categorias[pasta].escondido;
      } else {
        comando.categoria = null;
        comando.escondido = true;
        throw new Error(`Categoria não definida ou incorreta em ${comando.nome}`);
      }

      client.comandos.set(comando.nome, comando);
      listaComandos.push(comando); // serve so para dar log
      client.log("verbose", `Comando foi registrado: ${comando.nome} `);
    } catch (err) {
      client.log("critico", `O comando "${pasta}/${arquivo}" será ignorado\n${err.stack}`);
    }
  }

  client.log("bot", "Comandos:", null, true);
  console.table(listaComandos, ["categoria", "nome", "suporteBarra"]);
};

/**
 * Registrar os comandos para o Discord
 * @param {Boolean} global Se deve definir os comandos globalmente
 * @param {Boolean} testes Se deve definir os comandos de teste
 * @param {Boolean} todosEmTeste Se deve definir todos os comandos como teste
 */
module.exports.registrar = async (global = true, testes = true, todosEmTeste = false) => {
  let comandos = [];
  let comandosTeste = [];

  client.comandos.each(comando => {
    if (comando.suporteBarra === true || comando.suporteBarra === "ambos") {
      const estaTestando = comando.categoria === "testes" || comando.testando === true;
      const opcoes = comando.opcoes;

      // Mudar as descrições das opções
      opcoes.forEach(opcao => {
        // Mudar as descrições dos sub comandos
        if (opcao.type === client.defs.tiposOpcoes.SUB_COMMAND) {
          opcao.description = `${estaTestando ? "(Testando)" : ""}`
            + `【${comando.emoji}】${comando.descricao}`;
        }

        // Mudar as descrições dos sub comandos do grupo
        if (opcao.type === client.defs.tiposOpcoes.SUB_COMMAND_GROUP) {
          for (const subGrupo of opcao.options) {
            subGrupo.description = `${estaTestando ? "(Testando)" : ""}`
              + `【${comando.emoji}】${comando.descricao}`;
          }
        }
      });

      const comandoApp = {
        name: comando.nome,
        description: `${estaTestando ? "(Testando)" : ""}【${comando.emoji}】${comando.descricao}`,
        type: client.defs.tiposComando.CHAT_INPUT,
        options: opcoes
      };

      // Adicionar comando em barra
      if (estaTestando || todosEmTeste) comandosTeste.push(comandoApp);
      else comandos.push(comandoApp);

      if (comando.nomeCtx) {
        const comandoCtx = {
          name: comando.nomeCtx,
          description: "",
          type: comando.tipoCtx,
        };

        // Adicionar comando contextual
        if (estaTestando || todosEmTeste) comandosTeste.push(comandoCtx);
        else comandos.push(comandoCtx);
      }
    }
  });

  //* Definir comandos globalmente
  if (global) {
    await client.application?.commands.set(comandos);
    client.log("bot", `${comandos.length} comandos globais foram registrados`);
  }

  //* Definir comandos de teste
  if (testes && process.env.SERVER_DE_TESTES) {
    await client.application?.commands.set(comandosTeste, process.env.SERVER_DE_TESTES);
    client.log("bot", `${comandosTeste.length} comandos de testes foram registrados`);
  }
};