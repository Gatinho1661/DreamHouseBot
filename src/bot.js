// Altera o titulo
process.stdout.write(
  String.fromCharCode(27) + "]0;DreamHouse Bot" + String.fromCharCode(7)
);

console.log("Iniciando DreamHouse Bot...");

require("dotenv").config();
require("./utilidades/checarVariaveis.js")();

const { Client, Events, Collection, GatewayIntentBits, ActivityType } = require("discord.js");
// const { DisTube } = require("distube");
// const { SpotifyPlugin } = require("@distube/spotify");
// const { SoundCloudPlugin } = require("@distube/soundcloud");
// const { YtDlpPlugin } = require("@distube/yt-dlp");
//const Enmap = require("enmap");

global.client = new Client({
  // define client como um objeto global
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    //GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildIntegrations,
    //GatewayIntentBits.GuildMessagePolls, TODO: Adicionar algo
    //GatewayIntentBits.GuildScheduledEvents, TODO: Adicionar avisos de eventos
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER", "THREADMEMBER"],
  presence: {
    activities: [
      {
        name: "🥴 Sendo arrumada...",
        type: ActivityType.Custom,
      },
    ],
    status: "dnd",
    afk: false,
  },
});

// client.distube = new DisTube(client, {
//   leaveOnFinish: true,
//   leaveOnStop: true,
//   leaveOnEmpty: true,
//   emptyCooldown: 5,
//   searchSongs: 25,
//   youtubeDL: false,
//   ytdlOptions: {
//     filter: "audioonly",
//     quality: "highestaudio",
//     highWaterMark: 1 << 25,
//   },
//   plugins: [
//     new YtDlpPlugin(),
//     new SpotifyPlugin({ emitEventsAfterFetching: true }),
//     new SoundCloudPlugin()
//   ],
// });

client.comandos = new Collection();
client.snipes = new Collection();
client.editSnipes = new Collection();
client.mensagens = new Collection();
client.cargosSalvos = new Collection();

// client.config = new Enmap({ name: "config" });
// if (!client.config.has("primeiraVez")) require("./utilidades/primeiraVez")();

// client.usuarios = new Enmap({ name: "usuarios" });
// client.relacionamentos = new Enmap({ name: "relacionamentos" });
// client.memes = new Enmap({ name: "memes" });
// client.autoCargos = new Enmap({ name: "autocargos" });
// client.nfs = new Enmap({ name: "nfs" });

// É necessário fazer isso... esse ENMAP vai de rodo na proxima
require("./db.js");

client.defs = require("./recursos/defs.json");
client.log = require("./modulos/log.js");
client.responder = require("./modulos/responder.js");
client.dir = __dirname;
client.prefixo = process.env.PREFIXO;

process.on("uncaughtException", (erro) => {
  client.log("critico", `Unhandled error: ${erro.stack}`);
});

require("./modulos/eventos")();
require("./modulos/comandos").carregar();

//* Fazer login
client.log("bot", "Fazendo login...");
client.login(process.env.TOKEN);
