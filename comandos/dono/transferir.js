//const { MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
    //* Infomações do comando
    emoji: "",
    nome: "transferir",
    sinonimos: [],
    descricao: "Tranferir banco de dados para nova versão",
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

    //* Comando
    async executar(msg) {

        const indexes = client.usuarioOld.indexes

        for (let i = 0; i < indexes.length; i++) {
            const usuarioId = indexes[i];

            let data = client.usuarioOld.get(usuarioId);

            data.nome = data.usuario;
            delete data.usuario;
            client.log("verbose", `nome foi definido ${data.nome} `);

            data.id = usuarioId
            client.log("verbose", `${data.nome} teve seu id definido ${data.id}`);

            if (data.aniversario !== null) {
                data.aniversario = `${2021 - data.idade} ${data.aniversario.mes} ${data.aniversario.dia} 00:00:00`;
                client.log("verbose", `o aniversario de ${data.nome} foi definido para ${new Date(data.aniversario)}`);
            } else {
                client.log("verbose", `${data.nome} não tem aniversario`);
            }

            client.usuarios.set(usuarioId, data);

            client.config.ensure("salvarMsgs", true);
            client.config.ensure("todosComandosDesativado", false);
            client.config.ensure("comandosDesativado", []);
            client.config.ensure("autoCargos", []);
            client.config.ensure("fixados", "");
            client.config.ensure("bichinhos", "");
            client.config.ensure("aniversarios", {
                "ativado": true,
                "alterarTop": true,
                "canal": null
            });
            client.config.ensure("msgCargos", {
                "canal": null,
                "id": null,
                "servidor": null
            });
            client.config.ensure("chegou", {
                "canalID": null,
                "gif": "",
                "msg": "Chegou sem escândalo ✨"
            });
            client.config.ensure("saida", {
                "canalID": null,
                "gif": "",
                "msg": "Saiu do server 😢"
            });
        }

        msg.react("👍");
    }
};