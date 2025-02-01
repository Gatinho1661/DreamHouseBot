// eslint-disable-next-line no-unused-vars
const { EmbedBuilder, Interaction } = require("discord.js");
const { formatarCanal } = require("../../modulos/utils");
const { interacoes } = require("../../modulos/nfs");

// Emitido quando uma interação é recebida
module.exports = {
  nome: "interactionCreate",
  once: false, // Se deve ser executado apenas uma vez
  origem: client,

  /**
   * 
   * @param {Interaction} interacao 
   * @returns 
   */
  async executar(interacao) {
    try {
      //* Comandos
      if (interacao.isCommand()) {
        const iCmd = interacao;

        const excTempo = new Date();
        client.log(
          "comando",
          `${iCmd.commandName} usando em #${formatarCanal(iCmd.channel)} por @${iCmd.user.tag}`
        );

        const comando = client.comandos.get(iCmd.commandName);
        if (!comando) return client.log("critico", `Comando "${iCmd.commandName}" não encontrado`);

        //* Verificar se comando pode ser executado
        if (client.config.get("todosComandosDesativado") === true) {
          if (client.application.owner.id !== iCmd.user.id) return;
        }
        const desativado = client.config
          .get("comandosDesativado")
          .find(c => c.nome === comando.nome);
        if (desativado) {
          if (client.application.owner.id !== iCmd.user.id) {
            //if (!desativado.motivo) return
            const data = { motivo: desativado.motivo };
            return client.emit("comandoBloqueado", iCmd, "desativado", data);
          }
        }
        if (comando.apenasDono) {
          if (client.application.owner.id !== iCmd.user.id) {
            const data = {};
            return client.emit("comandoBloqueado", iCmd, "apenasDono", data);
          }
        }
        if (comando.apenasServidor) {
          if (/DM|GROUP_DM|UNKNOWN/.test(iCmd.channel.type)) {
            const data = {};
            return client.emit("comandoBloqueado", iCmd, "apenasServidor", data);
          }
        }

        // Se o comando tiver sendo executado em uma DM não precisa verificar isso
        if (!/DM|GROUP_DM|UNKNOWN/.test(iCmd.channel.type)) {
          if (comando.permissoes.bot) {
            const faltando = iCmd.channel.guild.members.me.permissions.missing(comando.permissoes.bot);
            if (faltando.length > 0) {
              const data = { faltando };
              return client.emit("comandoBloqueado", iCmd, "permBot", data);
            }
          }
          if (comando.permissoes.usuario) {
            const faltando = iCmd.member.permissions.missing(comando.permissoes.usuario);
            if (faltando.length > 0) {
              const data = { faltando };
              return client.emit("comandoBloqueado", iCmd, "permUsuario", data);
            }
          }
          if (comando.canalVoz) {
            if (!iCmd.member.voice.channel) {
              const data = {};
              return client.emit("comandoBloqueado", iCmd, "canalVoz", data);
            }

            if (
              iCmd.guild.me.voice.channelId && iCmd.member.voice.channelId
              !== iCmd.guild.me.voice.channelId
            ) {
              return client.responder(
                iCmd,
                "bloqueado",
                "Você não está no meu canal de voz",
                "Entre no meu canal para poder adicionar uma música"
              );
            }
          }
          if (comando.nsfw) {
            if (!iCmd.channel.nsfw) {
              const data = {};
              return client.emit("comandoBloqueado", iCmd, "nsfw", data);
            }
          }
        }

        try {
          const opcoes = {
            subComandoGrupo: iCmd.options.getSubcommandGroup(false),
            subComando: iCmd.options.getSubcommand(false)
          };

          //* Definir as opções
          const definirValor = (opcao) => {
            const valor = iCmd.options.get(opcao.name);

            // Se não tiver valor ou opcoes pula
            if (!valor && !opcao.options?.length) return null;

            switch (opcao.type) {
              //* Usuario
              case client.defs.tiposOpcoes.USER:
                return {
                  usuario: valor.user || null,
                  membro: valor.member || null
                };

              //* Mencionável
              case client.defs.tiposOpcoes.MENTIONABLE:
                return {
                  usuario: valor.user || null,
                  membro: valor.member || null,
                  cargo: valor.role || null
                };

              //* Canal
              case client.defs.tiposOpcoes.CHANNEL:
                return valor.channel;

              //* Cargo
              case client.defs.tiposOpcoes.ROLE:
                return valor.role;

              //* Sub Comando
              // Passa por todos as opcoes do sub comando
              case client.defs.tiposOpcoes.SUB_COMMAND: {
                const valoresDeGrupo = {};
                for (const subOpcao of opcao.options) {
                  valoresDeGrupo[subOpcao.name] = definirValor(subOpcao) || null;
                }
                return valoresDeGrupo;
              }

              //* Grupo Sub Comandos
              // Passa por todos os sub comandos, para passar por todas as opcoes
              case client.defs.tiposOpcoes.SUB_COMMAND_GROUP: {
                const subOpcoes = {};
                for (const subGrupo of opcao.options) {
                  subOpcoes[subGrupo.name] = definirValor(subGrupo) || null;
                }
                return subOpcoes;
              }

              //* String, Numero, Boolean, Integer
              default:
                return valor.value;
            }
          };

          //* Pegar as opções
          for (const opcao of comando.opcoes) {
            opcoes[opcao.name] = definirValor(opcao);
          }

          //* Executar comando
          await comando.executar(iCmd, opcoes);
          client.log(
            "comando",
            `${comando.nome} foi respondido em ${(new Date().getTime() - excTempo.getTime())}ms`
          );
        } catch (err) {
          client.log("erro", err.stack);
          client.log(
            "comando",
            `Ocorreu um erro em ${comando.nome} ao ser executado por @${iCmd.user.tag}`,
            "erro"
          );

          const Embed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.erro)
            .setTitle("❗ Ocorreu um erro ao executar esse comando")
            .setDescription(`Fale com o ${client.application.owner.toString()} para arrumar isso.`);
          if (iCmd.replied || iCmd.deferred) {
            iCmd.editReply({ content: null, embeds: [Embed], ephemeral: true }).catch();
          } else {
            iCmd.reply({ content: null, embeds: [Embed], ephemeral: true }).catch();
          }
        }
      }

      //* Comandos de menu contextual 
      if (interacao.isMessageContextMenuCommand() || interacao.isUserContextMenuCommand()) {
        const iCmd = interacao;

        const excTempo = new Date();
        client.log(
          "comando",
          `Comando contextual "${iCmd.commandName}"`
          + `usando em #${formatarCanal(iCmd.channel)} por @${iCmd.user.tag}`
        );

        const comando = client.comandos.find(c => c.nomeCtx === iCmd.commandName);
        if (!comando) {
          return client.log("critico", `Comando contextual "${iCmd.commandName}" não encontrado`);
        }

        //* Verificar se comando pode ser executado
        if (comando.apenasServidor) {
          if (/DM|GROUP_DM|UNKNOWN/.test(iCmd.channel.type)) {
            const data = {};
            return client.emit("comandoBloqueado", iCmd, "apenasServidor", data);
          }
        }

        //* Executar comando contextual
        try {
          await comando.executarCtx(iCmd);
          client.log(
            "comando",
            `Comando contextual "${iCmd.commandName}"`
            + `foi respondido em ${(new Date().getTime() - excTempo.getTime())}ms`
          );
        } catch (err) {
          client.log("erro", err.stack);
          client.log(
            "comando",
            `Ocorreu um erro em "${iCmd.commandName}" ao ser executado por @${iCmd.user.tag}`,
            "erro"
          );

          const Embed = new EmbedBuilder()
            .setColor(client.defs.corEmbed.erro)
            .setTitle("❗ Ocorreu um erro ao executar esse comando")
            .setDescription(`Fale com o ${client.application.owner.toString()} para arrumar isso.`);
          if (iCmd.replied) {
            iCmd.followUp({ content: null, embeds: [Embed], ephemeral: true }).catch();
          } else {
            iCmd.reply({ content: null, embeds: [Embed], ephemeral: true }).catch();
          }
        }
      }

      //* Componente de mensagem
      if (interacao.isMessageComponent()) {
        const iCMsg = interacao;

        let botaoId = iCMsg.customId.split("=");
        const categoria = botaoId[0];
        const id = botaoId[1];
        const valor = botaoId[2];

        client.log(
          "verbose",
          `@${iCMsg.user.tag} apertou "${iCMsg.customId}`
          + `"${iCMsg.message.flags.has(1 << 6) ? " em uma mensagem privada" : ""}`
          + ` msgId:${iCMsg.message.id}`
        );

        if (categoria === "nfs") interacoes(iCMsg, id, valor);
      }

      //* Autocompletar de comando
      if (interacao.isAutocomplete()) {
        const excTempo = new Date();
        const pesquisa = interacao.options.getFocused(true);

        // Pegar autocompletar do comando
        const comando = client.comandos.get(interacao.commandName);
        if (!comando) {
          return client.log("critico", `Comando "${interacao.commandName}" não encontrado`);
        }

        // Executar o autocompletar do comando
        const resultados = await comando.autocompletar(interacao, pesquisa);
        const excResultados = new Date();

        // Enviar resultados limitando para 25
        await interacao.respond(resultados.slice(0, 25))
          .then(() => {
            client.log(
              "verbose",
              `Autocompletar em ${comando.nome} por @${interacao.user.tag}: "${pesquisa.value}"`
              + ` com ${resultados.length} resultados`
              + ` em ${(excResultados.getTime() - excTempo.getTime())}ms`
              + ` respondido em ${(new Date().getTime() - excTempo.getTime())}ms`
            );
          })
          .catch(() => {
            client.log(
              "aviso",
              `Autocompletar em ${comando.nome} por @${interacao.user.tag}: "${pesquisa.value}"`
              + " não foi respondida"
            );
          });
      }

    } catch (err) {
      client.log("erro", err.stack);
    }
  }
};