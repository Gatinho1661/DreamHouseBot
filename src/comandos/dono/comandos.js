const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { coletorICMsg } = require("../../utilidades/coletores");
const { registrar } = require("../../modulos/comandos");

module.exports = {
  //* Infomações do comando
  emoji: "",
  nome: "comandos",
  sinonimos: ["cmd"],
  descricao: "Atualiza ou remove todos os comandos /",
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
      const Embed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("⛔ Faltando argumentos")
        .setDescription("Você quer atualizar ou remover os comandos?");
      await msg.channel.send({
        content: null,
        embeds: [Embed],
        reply: { messageReference: msg }
      }).catch();
      return;
    }

    if (args[0] === "remover") {
      const todos = new ButtonBuilder()
        .setCustomId("todos")
        .setLabel("Todos")
        .setDisabled(false)
        .setStyle(ButtonStyle.Danger);
      const globalmente = new ButtonBuilder()
        .setCustomId("globalmente")
        .setLabel("Globalmente")
        .setDisabled(false)
        .setStyle(ButtonStyle.Danger);
      const servidor = new ButtonBuilder()
        .setCustomId("servidor")
        .setLabel("Servidor")
        .setDisabled(false)
        .setStyle(ButtonStyle.Danger);
      const cancelar = new ButtonBuilder()
        .setCustomId("cancelar")
        .setLabel("Cancelar")
        .setDisabled(false)
        .setStyle(ButtonStyle.Primary);
      let botoes = [todos, globalmente, servidor, cancelar];

      const Embed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.carregando)
        .setTitle("🗑️ Remover comandos")
        .setDescription("Você deseja remover todos os comandos de onde?")
        .setFooter({
          text: "Escolha clicando nos botões",
          iconURL: msg.author.displayAvatarURL({ dynamic: true, size: 32 })
        });
      const resposta = await msg.channel.send({
        content: null,
        embeds: [Embed],
        components: [new ActionRowBuilder().addComponents(botoes)],
        reply: { messageReference: msg }
      }).catch();

      //* Respostas para cada botão apertado
      const respostas = {
        async todos(iBto) {
          await client.application?.commands.set([]); // Remover comandos globalmente
          await client.application?.commands.set([], msg.guild.id); // Remover comandos do servidor

          Embed
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🗑️ Comandos removido")
            .setDescription(`Todos os comandos globais e do servidor ${msg.guild.name} foram removidos`)
            .setFooter(null);
          await iBto.update({ embeds: [Embed] });

          client.log("bot", `Todos os comandos globais e do servidor ${msg.guild.name} foram removidos`);

          return true;
        },
        async globalmente(iBto) {
          await client.application?.commands.set([]); // Remover comandos globalmente

          Embed
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🗑️ Comandos removido")
            .setDescription("Todos os comandos globais foram removidos")
            .setFooter(null);
          await iBto.update({ embeds: [Embed] });

          client.log("bot", "Todos os comandos globais foram removidos");

          return true;
        },
        async servidor(iBto) {
          await client.application?.commands.set([], msg.guild.id); // Remover comandos do servidor

          Embed
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🗑️ Comandos removido")
            .setDescription(`Todos os comandos do servidor ${msg.guild.name} foram removidos`)
            .setFooter(null);
          await iBto.update({ embeds: [Embed] });

          client.log("bot", `Todos os comandos do servidor ${msg.guild.name} foram removidos`);

          return true;
        },
        async cancelar(iBto) {

          Embed
            .setColor(client.defs.corEmbed.carregando)
            .setFooter(null);
          await iBto.update({ embeds: [Embed] });

          return true;
        }
      };

      //* Coletor de interações
      const filtro = (iBto) => iBto.user.id !== msg.author.id;
      coletorICMsg(msg, this, resposta, respostas, filtro);

    } else if (args[0] === "atualizar") {

      //* Registrar os comandos
      await registrar(true, true, true);

      client.log("bot", "Todos os comandos / foram atualizados globalmente e do servidor de testes");

      const Embed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.sim)
        .setTitle("✅ Comandos atualizados")
        .setDescription("Todos os comandos / foram atualizados globalmente e do servidor de testes");
      await msg.channel.send({
        content: null,
        embeds: [Embed],
        reply: { messageReference: msg }
      }).catch();

    } else {
      const Embed = new EmbedBuilder()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("⛔ Argumentos errados")
        .setDescription("Você quer atualizar ou remover os comandos?");
      await msg.channel.send({
        content: null,
        embeds: [Embed],
        reply: { messageReference: msg }
      }).catch();
    }
  }
};