const { MessageButton, MessageEmbed } = require("discord.js");
const { formatarCanal } = require("../../modulos/utils");

module.exports = {
    //* Infomações do comando
    emoji: "ℹ️",
    nome: "ajuda",
    sinonimos: ["help", "comandos"],
    descricao: "Mostra a lista com todos os comandos",
    exemplos: ["!paginas"],
    usos: "({numeroPag} ou {comando})",
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

    //* Comando
    async executar(msg) {
        let embedsarray = []

        const capitalizar = (string) => string.charAt(0).toUpperCase() + string.slice(1);

        const menuEmbed = new MessageEmbed()
            .setColor(client.defs.corEmbed.normal)
            .setTitle('ℹ️ Ajuda')
            .setDescription("Escreva [`!ajuda [comando]`](https://nao.clique/de.hover '!ajuda ping\n!ajuda avatar') para receber ajuda de um comando")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        for (const id of Object.keys(client.defs.categorias)) {
            const categoria = client.defs.categorias[id];
            if (categoria.escondido) break;

            menuEmbed.addField(
                `${categoria.emoji} ${capitalizar(categoria.nome)}`,
                `${categoria.descricao}`
            );

            const comandos = client.comandos.filter(c => c.categoria === id).array();

            const Embed = new MessageEmbed()
                .setColor(client.defs.corEmbed.normal)
                .setTitle(`📃 Comandos de ${categoria.nome}`)
                .setDescription(categoria.descricao)
            for (const comando of comandos) {
                Embed.addField(
                    `${comando.emoji} ${capitalizar(comando.nome)}${comando.sinonimos.length > 0 ? ` (${comando.sinonimos.join(", ")})` : ""}`,
                    `${comando.descricao}`
                );
            }

            embedsarray.push(Embed)
        }
        embedsarray.unshift(menuEmbed.setFooter(`Veja outras páginas, clicando nos botões • Página 0/${embedsarray.length}`))

        var pagina = 0;

        const voltar = new MessageButton()
            .setCustomId(`voltar`)
            .setLabel('<<')
            .setDisabled(false)
            .setStyle('SECONDARY');

        const menu = new MessageButton()
            .setCustomId('menu')
            .setLabel('O')
            .setDisabled(false)
            .setStyle("PRIMARY")

        const progredir = new MessageButton()
            .setCustomId('progredir')
            .setLabel('>>')
            .setDisabled(false)
            .setStyle("SECONDARY");

        const resposta = await msg.channel.send({
            content: null,
            embeds: [menuEmbed],
            components: [[
                voltar.setDisabled(true),
                menu.setDisabled(true),
                progredir
            ]],
            reply: { messageReference: msg }
        }).catch();

        const respostas = {
            voltar(i) {
                if (pagina === 0) return client.log("aviso", `Comando "${module.exports.nome}" com paginas dessincronizadas (${msg.id})`);

                --pagina
                i.update({
                    content: resposta.content || null,
                    embeds: [embedsarray[pagina].setFooter(`Veja outras páginas, clicando nos botões • Página ${pagina}/${embedsarray.length - 1}`)],
                    components: [[
                        voltar.setDisabled(pagina <= 0),
                        menu.setDisabled(pagina <= 0),
                        progredir.setDisabled(embedsarray.length - 1 <= pagina)
                    ]]
                }).catch();
            },
            menu(i) {
                if (pagina === 0) return client.log("aviso", `Comando "${module.exports.nome}" com paginas dessincronizadas (${msg.id})`);

                pagina = 0
                i.update({
                    content: resposta.content || null,
                    embeds: [embedsarray[pagina].setFooter(`Veja outras páginas, clicando nos botões • Página ${pagina}/${embedsarray.length - 1}`)],
                    components: [[
                        voltar.setDisabled(pagina <= 0),
                        menu.setDisabled(pagina <= 0),
                        progredir.setDisabled(embedsarray.length - 1 <= pagina)
                    ]]
                }).catch();
            },
            progredir(i) {
                if (embedsarray.length - 1 <= pagina) return client.log("aviso", `Comando "${module.exports.nome}" com paginas dessincronizadas (${msg.id})`);

                ++pagina
                i.update({
                    content: resposta.content || null,
                    embeds: [embedsarray[pagina].setFooter(`Veja outras páginas, clicando nos botões • Página ${pagina}/${embedsarray.length - 1}`)],
                    components: [[
                        voltar.setDisabled(pagina <= 0),
                        menu.setDisabled(pagina <= 0),
                        progredir.setDisabled(embedsarray.length - 1 <= pagina)
                    ]]
                }).catch();
            }
        }
        const coletor = resposta.createMessageComponentCollector({ time: 180000, idle: 60000 })
        client.log("info", `Coletor de botões iniciado em #${formatarCanal(msg.channel)} por @${msg.author.tag} id:${msg.id}`)

        coletor.on("collect", i => {
            try {
                if (i.user.id !== msg.author.id) {
                    const cuidaEmbed = new MessageEmbed()
                        .setColor(client.defs.corEmbed.nao)
                        .setTitle(`⛔ Cuida da sua vida`)
                        .setDescription("essa mensagem não foi direcionada a você");
                    return i.reply({ content: null, embeds: [cuidaEmbed], ephemeral: true })
                }

                respostas[i.customId](i);
                client.log("verbose", `@${i.user.tag} apertou "${i.customId}" pagina: ${pagina}/${embedsarray.length - 1} id:${msg.id}`)
            } catch (err) {
                client.log("erro", err.stack)
                client.log("comando", `Ocorreu um erro em ${this.nome} ao ser executado por @${msg.author.tag}`, "erro");

                coletor.stop("erro")
            }
        })

        coletor.once('end', (coletado, razao) => {
            client.log("info", `Coletor de botões terminado por ${razao} em #${formatarCanal(msg.channel)}, coletando ${coletado.size} interações id:${msg.id}`);

            let botoes = []
            if (razao === "erro") {
                const erro = new MessageButton()
                    .setCustomId(`erro`)
                    .setLabel('Ocorreu um erro')
                    .setDisabled(true)
                    .setStyle('DANGER');
                botoes = [[erro]]
            }
            if (razao === "time") {
                const tempo = new MessageButton()
                    .setCustomId(`tempo`)
                    .setLabel("Tempo esgotado")
                    .setDisabled(true)
                    .setStyle('SECONDARY');
                botoes = [[tempo]];
            }
            if (razao === "idle") {
                const idle = new MessageButton()
                    .setCustomId(`tempo`)
                    .setLabel("Inatividade")
                    .setDisabled(true)
                    .setStyle('SECONDARY');
                botoes = [[idle]];
            }

            resposta.edit({
                content: resposta.content || null,
                embeds: resposta.embeds,
                components: botoes
            }).catch();
        });
    }
};
