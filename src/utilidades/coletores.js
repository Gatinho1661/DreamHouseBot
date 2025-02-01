// eslint-disable-next-line no-unused-vars
const { EmbedBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Message } = require("discord.js");
const { formatarCanal } = require("../modulos/utils");

/**
 * Coletor de interações de componentes em comandos
 * @param {CommandInteraction} iCmd Interação de comando
 * @param {Message} resposta Mensagem enviada para o usuario
 * @param {*} respostas 
 * @param {*} filtro 
 */
exports.coletorICCmd = (iCmd, resposta, respostas, filtro) => {
  const coletor = resposta.createMessageComponentCollector({ time: 180000, idle: 60000 });
  client.log(
    "info",
    `Coletor de interações de componente iniciado em #${formatarCanal(iCmd.channel)} `
    + `por @${iCmd.user.tag} msgId:${resposta.id}`
  );
  let selecionado = null;
  let selecionadoTipo = null;

  coletor.on("collect", async iCMsg => {
    if (filtro(iCMsg)) {
      const cuidaEmbed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("⛔ Cuida da sua vida")
        .setDescription("Essa mensagem não foi direcionada a você");
      return iCMsg.reply({ content: null, embeds: [cuidaEmbed], ephemeral: true });
    }

    try {
      const resultado = await respostas[iCMsg.customId](iCMsg);
      selecionado = iCMsg.componentType === "SELECT_MENU" ? iCMsg.values : iCMsg.customId;
      selecionadoTipo = iCMsg.componentType;

      if (resultado) coletor.stop("finalizado");
    } catch (err) {
      client.log("erro", err.stack);
      client.log(
        "comando",
        `Ocorreu um erro em ${iCmd.commandName} ao ser executado por @${iCmd.user.tag}`,
        "erro"
      );

      coletor.stop("erro");
    }
  });

  coletor.once("end", (coletado, razao) => {
    client.log(
      "info",
      `Coletor de interações de componente ${razao} em #${formatarCanal(iCmd.channel)}, `
      + `coletando ${coletado.size} interações msgId:${resposta.id}`
    );
    if (razao === "finalizado") {
      for (const actionRows of resposta.components) {
        for (const componente of actionRows.components) {
          if (componente.style === ButtonStyle.Link) continue; // se for um botao de link ignore

          componente.setDisabled(true); // desativa o componente

          //trocar o estilo de todos menos o botao selecionado
          if (componente.customId !== selecionado) componente.setStyle?.(ButtonStyle.Secondary);

          //mostra os intens selecionados
          if (componente.type === "SELECT_MENU" && selecionadoTipo === "SELECT_MENU") {
            for (const opcao of componente.options) {
              if (selecionado.includes(opcao.value)) opcao.default = true;
              else opcao.default = false;
            }
          }
        }
      }

      iCmd.editReply({ components: resposta.components }).catch();
      return;
    }

    const botaoFinalizado = new ButtonBuilder();
    if (razao === "erro") {
      botaoFinalizado
        .setCustomId("erro")
        .setLabel("Ocorreu um erro")
        .setDisabled(true)
        .setStyle(ButtonStyle.Danger);
    }
    if (razao === "time") {
      botaoFinalizado
        .setCustomId("tempo")
        .setLabel("Tempo esgotado")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary);
    }
    if (razao === "idle") {
      botaoFinalizado
        .setCustomId("tempo")
        .setLabel("Inatividade")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary);
    }

    iCmd.editReply({ components: [{ type: "ACTION_ROW", components: [botaoFinalizado] }] }).catch();
  });
};

/**
 * Coletor de interações de componentes em mensagem
 * @param {Message} msg Mensagem recebida do usuario
 * @param {*} comando Comando executado
 * @param {Message} resposta Mensagem enviada para o usuario
 * @param {*} respostas 
 * @param {*} filtro 
 */
exports.coletorICMsg = (msg, comando, resposta, respostas, filtro) => {
  const coletor = resposta.createMessageComponentCollector({ time: 180000, idle: 60000 });
  client.log(
    "info",
    `Coletor de interações de componente iniciado em #${formatarCanal(msg.channel)} `
    + `por @${msg.author.tag} msgId:${resposta.id}`
  );
  let selecionado = null;
  let selecionadoTipo = null;

  coletor.on("collect", async iCMsg => {
    if (filtro(iCMsg)) {
      const cuidaEmbed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("⛔ Cuida da sua vida")
        .setDescription("Essa mensagem não foi direcionada a você");
      return iCMsg.reply({ content: null, embeds: [cuidaEmbed], ephemeral: true });
    }

    try {
      const resultado = await respostas[iCMsg.customId](iCMsg);
      selecionado = iCMsg.componentType === "SELECT_MENU" ? iCMsg.values : iCMsg.customId;
      selecionadoTipo = iCMsg.componentType;

      if (resultado) coletor.stop("finalizado");
    } catch (err) {
      client.log("erro", err.stack);
      client.log(
        "comando",
        `Ocorreu um erro em ${comando.nome} ao ser executado por @${msg.author.tag}`,
        "erro"
      );

      coletor.stop("erro");
    }
  });

  coletor.once("end", (coletado, razao) => {
    client.log(
      "info",
      `Coletor de interações de componente ${razao} em #${formatarCanal(msg.channel)}, `
      + `coletando ${coletado.size} interações msgId:${resposta.id}`
    );
    if (razao === "finalizado") {
      for (const actionRows of resposta.components) {
        for (const componente of actionRows.components) {
          if (componente.style === ButtonStyle.Link) continue; // se for um botao de link ignore

          componente.setDisabled(true); // desativa o componente

          //trocar o estilo de todos menos o botão selecionado
          if (componente.customId !== selecionado) componente.setStyle?.(ButtonStyle.Secondary);

          //mostra os itens selecionados
          if (componente.type === "SELECT_MENU" && selecionadoTipo === "SELECT_MENU") {
            for (const opcao of componente.options) {
              if (selecionado.includes(opcao.value)) opcao.default = true;
            }
          }
        }
      }

      resposta.edit({ components: resposta.components }).catch();
      return;
    }

    const botaoFinalizado = new ButtonBuilder();
    if (razao === "erro") {
      botaoFinalizado
        .setCustomId("erro")
        .setLabel("Ocorreu um erro")
        .setDisabled(true)
        .setStyle(ButtonStyle.Danger);
    }
    if (razao === "time") {
      botaoFinalizado
        .setCustomId("tempo")
        .setLabel("Tempo esgotado")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary);
    }
    if (razao === "idle") {
      botaoFinalizado
        .setCustomId("tempo")
        .setLabel("Inatividade")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary);
    }

    resposta.edit({ components: [{ type: "ACTION_ROW", components: [botaoFinalizado] }] }).catch();
  });
};