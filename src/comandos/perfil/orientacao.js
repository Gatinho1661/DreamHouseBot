const { MessageButton, MessageEmbed } = require("discord.js");
const mongoose = require("mongoose");
const { coletorICCmd } = require("../../utilidades/coletores");
const { capitalizar } = require("../../modulos/utils");

module.exports = {
  //* Infomações do comando
  emoji: "🏳️‍🌈",
  nome: "orientacao",
  sinonimos: [],
  descricao: "Escolha sua orientação sexual",
  exemplos: [
    { comando: "orientacao [orientacao]", texto: "Define sua orientação sexual" }
  ],
  args: "",
  opcoes: [
    {
      name: "orientacao",
      description: "A orientação que se indentifica",
      type: client.defs.tiposOpcoes.STRING,
      required: true,
    },
  ],
  canalVoz: false,
  contaPrimaria: false,
  apenasServidor: false,
  apenasDono: false,
  nsfw: false,
  permissoes: {
    usuario: [],
    bot: ["SEND_MESSAGES"]
  },
  cooldown: 1,
  escondido: false,
  suporteBarra: true,
  testando: false,

  //* Comando
  async executar(iCmd, opcoes) {
    const orientacao = capitalizar(opcoes.orientacao.toLowerCase()); // Capitalizar

    if (!/([a-zA-Zà-úÀ-Ú]{3,}$)/i.test(orientacao)) {
      return client.responder(
        iCmd,
        "bloqueado",
        "Orientação inválida",
        "Sua orientação só pode conter letras e ser maior que 2 caracteres"
      );
    }

    //* Pegar dados do usuário
    const Usuario = mongoose.model("Usuario");
    const usuarioPerfil = await Usuario.findOne({ "contas": iCmd.user.id });

    //* TODO define os dados do usuário da pessoa caso nao tenha
    if (!usuarioPerfil) {
      return client.responder(
        iCmd,
        "bloqueado",
        "Você não tem um perfil",
        "você não criou seu perfil ainda"
      );
    }

    const sim = new MessageButton()
      .setCustomId("sim")
      .setLabel("Sim")
      .setDisabled(false)
      .setStyle("SUCCESS");
    const editar = new MessageButton()
      .setCustomId("editar")
      .setLabel("Editar")
      .setDisabled(false)
      .setStyle("PRIMARY");
    const cancelar = new MessageButton()
      .setCustomId("cancelar")
      .setLabel("Cancelar")
      .setDisabled(false)
      .setStyle("DANGER");
    const adicionando = usuarioPerfil.orientacao === null;
    let botoes = adicionando ? [sim, cancelar] : [editar, cancelar];

    const Embed = new MessageEmbed()
      .setColor(client.defs.corEmbed.carregando)
      .setTitle(adicionando ? "🏳️‍🌈 Definir orientação sexual" : "🏳️‍🌈 Editar orientação sexual")
      .setFooter({
        text: "Escolha clicando nos botões",
        iconURL: iCmd.user.displayAvatarURL({ dynamic: true, size: 32 })
      });
    adicionando
      ? Embed.addFields([
        { name: "Orientação sexual", value: orientacao, inline: false },
      ])
      : Embed.addFields([
        { name: "Sua orientação sexual", value: usuarioPerfil.orientacao, inline: false },
        { name: "Você deseja editar para", value: orientacao, inline: false },
      ]);
    const resposta = await iCmd.reply({
      content: null,
      embeds: [Embed],
      components: [{ type: "ACTION_ROW", components: botoes }],
      fetchReply: true,
      ephemeral: true
    }).catch();

    //* Respostas para cada botão apertado
    const respostas = {
      async sim(iCMsg) {
        usuarioPerfil.orientacao = orientacao;
        await usuarioPerfil.save();

        client.log("info", `Orientação sexual de ${iCmd.user.tag} foi definido para ${orientacao}`);

        Embed
          .setColor(client.defs.corEmbed.sim)
          .setTitle("🏳️‍🌈 Orientação sexual adicionado")
          .setFooter(null);
        await iCMsg.update({ embeds: [Embed] });

        return true;
      },
      async editar(iCMsg) {
        usuarioPerfil.orientacao = orientacao;
        await usuarioPerfil.save();

        client.log("info", `Orientação sexual de ${iCmd.user.tag} foi definido para ${orientacao}`);

        Embed
          .setColor(client.defs.corEmbed.normal)
          .setTitle("🏳️‍🌈 Orientação sexual editado")
          .setFooter(null);
        await iCMsg.update({ embeds: [Embed] });

        return true;
      },
      async cancelar(iCMsg) {
        client.log("info", "Cancelado");

        Embed
          .setColor(client.defs.corEmbed.nao)
          .setTitle("❌ Cancelado")
          .setFooter(null);
        await iCMsg.update({ embeds: [Embed] });

        return true;
      }
    };

    //* Coletor de interações
    const filtro = (i) => i.user.id !== iCmd.user.id;
    coletorICCmd(iCmd, resposta, respostas, filtro);
  }
};