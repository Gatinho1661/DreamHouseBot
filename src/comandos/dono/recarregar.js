const { EmbedBuilder } = require("discord.js");
const fg = require("fast-glob");

module.exports = {
  //* Infomações do comando
  emoji: "",
  nome: "recarregar",
  sinonimos: ["r", "reload"],
  descricao: "Recarrega comandos",
  exemplos: [],
  args: "",
  canalVoz: false,
  contaPrimaria: false,
  apenasServidor: false,
  apenasDono: true,
  nsfw: false,
  permissoes: {
    usuario: [],
    bot: ["SEND_MESSAGES"]
  },
  cooldown: 1,
  escondido: true,
  suporteBarra: false,

  //* Comando
  async executarMsg(msg, args) {

    if (!args[0]) {
      const semArgs = new EmbedBuilder()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("⛔ Faltando argumentos")
        .setDescription("Qual comando você quer recarregar?");
      await msg.channel.send({
        content: null,
        embeds: [semArgs],
        reply: { messageReference: msg }
      }).catch();
      return;
    }

    const comando = client.comandos.get(args[0].toLowerCase())
      || client.comandos.find(cmd => cmd.sinonimos.includes(args[0].toLowerCase()));

    if (comando) {
      //* Encontrar o arquivo do comando
      const comandos = fg.sync("*.js", { cwd: client.dir + "/comandos", baseNameMatch: true });
      const comandoArquivo = comandos.find((comandoEncontrado) => {
        return comandoEncontrado.includes(`${comando.nome}.js`);
      });
      const pasta = comandoArquivo.split("/")[0];

      delete require.cache[require.resolve(client.dir + `/comandos/${comandoArquivo}`)];

      const comandoNovo = require(client.dir + `/comandos/${comandoArquivo}`);

      //* Definir a categoria do comando
      if (client.defs.categorias[pasta]) {
        comandoNovo.categoria = pasta;
        comandoNovo.escondido = comandoNovo.categoria.escondido;
      } else throw new Error("Comando sem categoria");

      client.comandos.set(comando.nome, comandoNovo);
      client.log("bot", `Comando ${comandoNovo.nome} recarregado`);


      switch (args[1]) {
        case "globalmente": {
          let comandoEnviado = await client.application?.commands.fetch();
          comandoEnviado = comandoEnviado.find(c => c.name === comando.nome);

          if (comandoEnviado) {
            await comandoEnviado.edit({
              name: comandoNovo.nome,
              description: `【${comandoNovo.emoji}】${comandoNovo.descricao}`,
              type: client.defs.tiposComando.CHAT_INPUT,
              options: comandoNovo.opcoes
            });
          } else {
            await client.application?.commands.create({
              name: comandoNovo.nome,
              description: `【${comandoNovo.emoji}】${comandoNovo.descricao}`,
              type: client.defs.tiposComando.CHAT_INPUT,
              options: comandoNovo.opcoes
            });
          }

          client.log("bot", `Comando ${comandoNovo.nome} atualizado globalmente`);

          const Embed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.sim)
            .setTitle("✅ Comando recarregado e atualizado globalmente")
            .setDescription(`\`${comando.nome}\` foi atualizado globalmente`);
          await msg.channel.send({
            content: null,
            embeds: [Embed],
            reply: { messageReference: msg }
          }).catch();

          break;
        }
        case "servidor": {
          let comandoEnviado = await client.application?.commands.fetch({
            guildId: process.env.SERVER_DE_TESTES
          });
          comandoEnviado = comandoEnviado.find(c => c.name === comando.nome);

          if (comandoEnviado) {
            await comandoEnviado.edit({
              name: comandoNovo.nome,
              description: `(Teste)【${comando.emoji}】${comando.descricao}`,
              type: client.defs.tiposComando.CHAT_INPUT,
              options: comandoNovo.opcoes
            });
          } else {
            await client.application?.commands.create({
              name: comandoNovo.nome,
              description: `(Teste)【${comando.emoji}】${comando.descricao}`,
              type: client.defs.tiposComando.CHAT_INPUT,
              options: comandoNovo.opcoes
            }, process.env.SERVER_DE_TESTES);
          }

          client.log("bot", `Comando ${comandoNovo.nome} atualizado no servidor de testes`);

          const Embed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.sim)
            .setTitle("✅ Comando recarregado e atualizado")
            .setDescription(`\`${comando.nome}\` foi atualizado no servidor de testes`);
          await msg.channel.send({
            content: null,
            embeds: [Embed],
            reply: { messageReference: msg }
          }).catch();

          break;
        }
        default: {
          const Embed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.sim)
            .setTitle("✅ Comando recarregado")
            .setDescription(`\`${comando.nome}\` foi recarregado`);
          await msg.channel.send({
            content: null,
            embeds: [Embed],
            reply: { messageReference: msg }
          }).catch();

          break;
        }

      }

    } else {
      const falhaEmbed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("❌ Comando não encontrado")
        .setDescription(`${args[0]} não foi encontrado`);
      await msg.channel.send({
        content: null,
        embeds: [falhaEmbed],
        reply: { messageReference: msg }
      }).catch();
    }
  }
};