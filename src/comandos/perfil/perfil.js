const { MessageEmbed } = require("discord.js");
const mongoose = require("mongoose");
const Duration = require("duration");
const { proximoAniversario, criarMencoes, criarTimestamp } = require("../../modulos/utils");

module.exports = {
  //* Infomações do comando
  emoji: "👤",
  nome: "perfil",
  sinonimos: [],
  descricao: "Veja as informações de perfil",
  exemplos: [
    { comando: "perfil", texto: "Veja seu perfil" },
    { comando: "perfil [usuario]", texto: "Veja o perfil de outra pessoa" }
  ],
  args: "",
  opcoes: [
    {
      name: "usuario",
      description: "O usuário que você quer ver o perfil",
      type: client.defs.tiposOpcoes.USER,
      required: false,
    },
  ],
  canalVoz: false,
  contaPrimaria: false,
  apenasServidor: true,
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

  async executar(iCmd, opcoes) {
    const usuario = opcoes.usuario?.membro || iCmd.member;

    if (usuario.bot) {
      return client.responder(iCmd, "bloqueado", "Bots não tem perfis", "Porque eles teriam um?");
    }

    const Usuario = mongoose.model("Usuario");
    const usuarioPerfil = await Usuario.findOne({ "contas": usuario.user.id })
      .populate("relacao.conjuge", "contas")
      .populate("relacao.amantes", "contas");

    const conjugePerfil = usuarioPerfil.relacao.conjuge;

    //TODO Criar um perfil automaticamente
    if (!usuarioPerfil) {
      return client.responder(
        iCmd,
        "bloqueado",
        "Esse usuário não tem um perfil",
        `${usuario.user.username} não criou seu perfil ainda`
      );
    }

    const contas = criarMencoes(usuarioPerfil.contas).join(", ");

    const nascimento = new Date(usuarioPerfil.dataNascimento);
    const nasceu = usuarioPerfil.dataNascimento ? nascimento.toLocaleDateString() : "??/??/????";
    const idade = usuarioPerfil.idade ? `${new Duration(nascimento).years} anos` : "?? anos";
    const aniversario = usuarioPerfil.dataNascimento
      ? criarTimestamp(proximoAniversario(nascimento), "R")
      : "???";

    const orientacao = usuarioPerfil.orientacao || "Não especificado";

    const formatosPronomes = { "ele": "Ele/Dele", "ela": "Ela/Dela", "elu": "Elu/Delu" };
    let pronomes = [];
    usuarioPerfil.pronomes.forEach(p => pronomes.push(formatosPronomes[p]));

    if (pronomes.length > 0) pronomes = pronomes.join(", ");
    else pronomes = "Não especificado";


    const conjuge = conjugePerfil
      ? `<@${conjugePerfil.contaPrincipal}> `
      + criarTimestamp(new Date(usuarioPerfil.relacao.dataCasamento), "R")
      : "Ninguém";

    // Pega as contas dos amantes e menciona eles
    const amantesContas = [];
    for (const amanteContas of usuarioPerfil.relacao.amantes) {
      amantesContas.push(amanteContas.contaPrincipal);
    }
    let amantes = criarMencoes(amantesContas).join(", ") || "Nenhum amante";

    const Embed = new MessageEmbed()
      .setColor(usuario.displayColor ? usuario.displayHexColor : client.defs.corEmbed.normal)
      .setAuthor({
        name: `Perfil de ${usuario.user.username}`,
        iconURL: usuario.user.displayAvatarURL({ dynamic: true, size: 32 })
      })
      .addFields(
        { name: "👤 Contas", value: contas, inline: false },
        { name: "🍼 Nasceu", value: nasceu, inline: true },
        { name: "🎂 Idade", value: idade, inline: true },
        { name: "🎉 Aniversário", value: aniversario, inline: true },
        { name: "🏳️‍🌈 Orientação sexual", value: orientacao, inline: true },
        { name: "⚧ Pronomes", value: pronomes, inline: true },
        { name: "💍 Casou-se com", value: conjuge },
        { name: "💕 Amantes", value: amantes }
      )
      .setThumbnail(usuario.user.displayAvatarURL({ dynamic: true, size: 1024 }));
    await iCmd.reply({ content: null, embeds: [Embed] }).catch();
  },

  //* Comandos de menu contextual
  nomeCtx: "Perfil",
  tipoCtx: client.defs.tiposComando.USER,
  async executarCtx(iCtx) {
    const opcoes = {
      usuario: {
        membro: iCtx.targetMember
      }
    };
    await this.executar(iCtx, opcoes);
  }
};