const { EmbedBuilder } = require("discord.js");
const { traduzirPerms } = require("../../modulos/utils");

// Emitido quando um comando é bloqueado de ser executado
module.exports = {
  nome: "comandoBloqueado",
  once: false, // Se deve ser executado apenas uma vez
  origem: client,

  /**
   * 
   * @param {*} iCmd Interação de comando
   * @param { "desativado"
   * | "permUsuario"
   * | "permBot"
   * | "apenasServidor"
   * | "nsfw"
   * | "canalvoz"
   * | "apenasDono" } razao Razão do comando ser bloqueado
   * @param {{motivo: string, faltando: string[], restante: number}} data 
   * @returns Mensagem
   */
  async executar(iCmd, razao, data) {
    try {
      const cmd = client.comandos.get(iCmd.commandName);
      if (!cmd) throw new Error("Comando não encontrado");

      switch (razao) {
        case "desativado": {
          client.log(
            "comando",
            `${cmd.nome} foi bloqueado de ser executado por que o comando está desativado`
          );
          if (!data.motivo) return;

          const desativadoEmbed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🚫 Comando desativado")
            .setDescription(`${data.motivo}`);
          return await iCmd.reply({ content: null, embeds: [desativadoEmbed], ephemeral: true });
        }

        case "permUsuario": {
          client.log(
            "comando",
            `${cmd.nome} foi bloqueado de ser executado por falta de permissão do usuário`
          );
          const userPemrsEmbed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("📛 Permissão necessária")
            .setDescription(
              "você precisa ter permissões de"
              + ` ${traduzirPerms(data.faltando).join(", ")}\` para fazer isso`
            );
          return await iCmd.reply({ content: null, embeds: [userPemrsEmbed], ephemeral: true });
        }

        case "permBot": {
          client.log(
            "comando",
            `${cmd.nome} foi bloqueado de ser executado por falta de permissão do bot`,
            "erro"
          );
          const clientPemrsEmbed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("📛 Permissão necessária")
            .setDescription(
              `eu não tenho permissões de \`${traduzirPerms(data.faltando).join(", ")}\` para fazer isso`
            )
            .setImage(client.defs.imagens.anivesario);
          return await iCmd.reply({ content: null, embeds: [clientPemrsEmbed], ephemeral: true });
        }

        case "apenasServidor": {
          client.log(
            "comando",
            `${cmd.nome} foi bloqueado de ser executado por ser um comando de apenas server`
          );
          const guildEmbed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🚫 Aqui não")
            .setDescription("você precisa está em um `servidor` para fazer isso");
          return await iCmd.reply({ content: null, embeds: [guildEmbed], ephemeral: true });
        }

        case "nsfw": {
          client.log(
            "comando",
            `${cmd.nome} foi bloqueado de ser executado por ser um comando NSFW fora do canal`
          );
          const nsfwEmbed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🚫 Aqui não")
            .setDescription("você precisa está em um canal `NSFW` para fazer isso");
          return await iCmd.reply({ content: null, embeds: [nsfwEmbed], ephemeral: true });
        }

        case "canalVoz": {
          client.log("comando", `${cmd.nome} foi bloqueado de ser executado por ser um comando de voz`);
          const vozEmbed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("🚫 Não consigo")
            .setDescription("você precisa está em um canal de `voz` para fazer isso");
          return await iCmd.reply({ content: null, embeds: [vozEmbed], ephemeral: true });
        }

        case "apenasDono": {
          client.log("comando", `${cmd.nome} foi bloqueado de ser executado por ser um comando de dono`);
          return;
        }

        default: {
          client.log("comando", `${cmd.nome} foi bloqueado de ser executado`);
          const Embed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.nao)
            .setTitle("❌ Ops")
            .setDescription("eu não posso executar esse comando");

          return await iCmd.reply({ content: null, embeds: [Embed], ephemeral: true });
        }
      }
    } catch (err) {
      client.log("erro", err.stack);
    }
  }
};