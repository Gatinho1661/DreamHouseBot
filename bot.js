const Discord = require('discord.js');
const Enmap = require("enmap");
require('dotenv').config();

global.client = new Discord.Client({ // define client como um objeto global
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_BANS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_INTEGRATIONS',
        //'GUILD_WEBHOOKS',
        //'GUILD_INVITES',
        //'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        //'GUILD_MESSAGE_TYPING',
        'DIRECT_MESSAGES',
        //'DIRECT_MESSAGE_REACTIONS',
        //'DIRECT_MESSAGE_TYPING',
        //'GUILD_SCHEDULED_EVENTS'
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
    presence: {
        activities: [
            {
                name: "as novas mudanças",
                type: "WATCHING"
            }
        ],
        status: "online",
        afk: false
    }
});

client.comandos = new Discord.Collection();
client.snipes = new Discord.Collection();
client.editSnipes = new Discord.Collection();
client.mensagens = new Discord.Collection();
client.cargosSalvos = new Discord.Collection();

client.config = new Enmap("config");
client.usuarioOld = new Enmap("usuario"); // Para compatibilidade com o Banco de dados antigo
client.usuarios = new Enmap("usuarios");
client.relacionamentoOld = new Enmap("relacionamento"); // Para compatibilidade com o Banco de dados antigo
client.relacionamentos = new Enmap("relacionamentos");
client.memes = new Enmap("memes");
client.autoCargos = new Enmap("autocargos");

client.defs = require("./data/defs.json");
client.log = require("./modulos/log.js");
client.responder = require("./modulos/responder.js");
client.dir = __dirname;
client.prefixo = process.env.prefixo;
client.dono = process.env.dono.split(" "); //TODO Tirar esse split (vai ter apenas um dono)

// Eventos
client.nfs = new Enmap("nfs");

process.on("uncaughtException", (erro) => {
    client.log("critico", `Unhandled error: ${erro.stack}`);
});

//* Executa se for a primeira vez
if (!client.config.has("primeiraVez")) require("./utilidades/primeiraVez")();

require("./modulos/eventos")();
require("./modulos/comandos").carregar();

//* Fazer login
client.login(process.env.TOKEN);

//TODO DOCS em todos os modulos, temporizadores e utilidades