const { MessageEmbed, MessageButton } = require("discord.js");
const { formatarCanal } = require("../../modulos/utils");

const filtro = /https?:\/\/(www.)?([/|.|\w|-])*\.(?:jpg|jpeg|gif|png|webp)/;

// Emitido quando uma mensagem nova é enviada
module.exports = {
  nome: "messageCreate",
  once: false, // Se deve ser executado apenas uma vez
  origem: client,

  async executar(msg) {
    if (msg.author.bot) return; // ignorar se for uma msg de bot

    const mensagem = msg.content.length > 100
      ? msg.content.slice(0, 100).replaceAll("\n", " ") + "..."
      : msg.content.replaceAll("\n", " ");

    //* Verificar se é uma mensagem nos fixados
    const canalFixadosId = client.config.get("fixados");
    const canalBichinhosId = client.config.get("bichinhos");
    if (msg.channel.id === canalFixadosId) {
      if (
        msg.attachments.first()
          ? filtro.test(msg.attachments.first().proxyURL)
          : filtro.test(msg.content)
      ) {
        const fixados = client.mensagens.get("fixados") || [];

        fixados.push(msg);
        client.mensagens.set("fixados", fixados);
        client.log("bot", `Fixado novo de @${msg.author.tag} adicionado (${msg.id})`);
      }
    }
    //* Verificar se é uma mensagem nos bichinhos
    if (msg.channel.id === canalBichinhosId) {
      if (
        msg.attachments.first()
          ? filtro.test(msg.attachments.first().proxyURL)
          : filtro.test(msg.content)
      ) {
        const bichinhos = client.mensagens.get("bichinhos") || [];

        bichinhos.push(msg);
        client.mensagens.set("bichinhos", bichinhos);
        client.log("bot", `Bichinho novo de @${msg.author.tag} adicionado (${msg.id})`);
      }
    }

    //* Verificar se é um comando
    if (!msg.content.startsWith(client.prefixo)) {
      return client.log(null, `#${formatarCanal(msg.channel)} | @${msg.author.tag}: ${mensagem}`);
    }

    const excTempo = new Date();

    const args = msg.content.slice(client.prefixo.length).trim().split(/ +/);
    const nomeComando = args.shift().toLowerCase();

    const comando = client.comandos.get(nomeComando)
      || client.comandos.find(cmd => cmd.sinonimos && cmd.sinonimos.includes(nomeComando));
    if (!comando) return;

    //* Executar apenas se for o dono do bot
    if (client.application.owner.id !== msg.author.id) {
      //TEMP Mensagem para avisar que apenas aceitara comandos barra
      const Embed = new MessageEmbed()
        .setColor(client.defs.corEmbed.nao)
        .setTitle("❌ Comandos por texto removidos")
        .setDescription(
          "Em resumo o Discord **removerar** o acesso dos bots verificados "
          + "a ler o conteúdo das mensagens, "
          + "esse bot não é verificado então **não será afetado**, "
          + "mas para **facilitar** o uso dos comandos, "
          + "irei **apenas** aceitar comandos por `/`"
        );

      // eslint-disable-next-line max-len
      const link = "https://support-dev.discord.com/hc/pt-br/articles/4404772028055-Message-Content-Privileged-Intent-for-Verified-Bots";

      const botao = new MessageButton()
        .setStyle("LINK")
        .setURL(link)
        .setLabel("Saiba mais");
      return msg.channel.send({
        content: null,
        embeds: [Embed],
        components: [{ type: "ACTION_ROW", components: [botao] }],
        reply: { messageReference: msg }
      }).catch();
    }

    client.log("comando", `#${formatarCanal(msg.channel)} | @${msg.author.tag}: ${mensagem}`);

    //* Executar comando
    await comando.executarMsg(msg, args)
      .then(() => {
        client.log(
          "comando",
          `${comando.nome} foi respondido em ${(new Date().getTime() - excTempo.getTime())}ms`
        );
      })
      .catch((err) => {
        if (!msg.channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
          return client.log("aviso", "A mensagem de erro não foi enviada por falta de permissões");
        }

        client.log("erro", err.stack);
        client.log(
          "comando",
          `Ocorreu um erro em ${comando.nome} ao ser executado por @${msg.author.tag}`,
          "erro"
        );

        const Embed = new MessageEmbed()
          .setColor(client.defs.corEmbed.erro)
          .setTitle("❗ Ocorreu um erro ao executar esse comando")
          .setDescription(`Fale com o ${client.application.owner.toString()} para arrumar isso.`);
        msg.channel.send({ content: null, embeds: [Embed], reply: { messageReference: msg } }).catch();
      });

  }
};