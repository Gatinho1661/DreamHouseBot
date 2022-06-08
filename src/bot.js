process.stdout.write(
  String.fromCharCode(27) + "]0;DreamHouse Bot" + String.fromCharCode(7)
);

console.log("Iniciando DreamHouse Bot...");

require("dotenv").config();
require("./utilidades/checarVariaveis.js")();

const Discord = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const mongoose = require("mongoose");
const Enmap = require("enmap");

global.client = new Discord.Client({
  // define client como um objeto global
  intents: [
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_BANS",
    "GUILD_EMOJIS_AND_STICKERS",
    "GUILD_INTEGRATIONS",
    //'GUILD_WEBHOOKS',
    //'GUILD_INVITES',
    "GUILD_VOICE_STATES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    //'GUILD_MESSAGE_TYPING',
    "DIRECT_MESSAGES",
    //'DIRECT_MESSAGE_REACTIONS',
    //'DIRECT_MESSAGE_TYPING',
    //'GUILD_SCHEDULED_EVENTS'
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
  presence: {
    activities: [
      {
        name: "...finalmente",
        type: "LISTENING",
      },
    ],
    status: "online",
    afk: false,
  },
});

client.distube = new DisTube(client, {
  leaveOnFinish: true,
  leaveOnStop: true,
  leaveOnEmpty: true,
  emptyCooldown: 5,
  searchSongs: 25,
  youtubeDL: false,
  ytdlOptions: {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
  plugins: [
    new YtDlpPlugin(),
    new SpotifyPlugin({ emitEventsAfterFetching: true }),
    new SoundCloudPlugin()
  ],
});

client.defs = require("./recursos/defs.json");
client.log = require("./modulos/log.js");
client.responder = require("./modulos/responder.js");
client.dir = __dirname;
client.prefixo = process.env.prefixo;

client.comandos = new Discord.Collection();
client.snipes = new Discord.Collection();
client.editSnipes = new Discord.Collection();
client.mensagens = new Discord.Collection();
client.cargosSalvos = new Discord.Collection();

client.config = new Enmap("config");
if (!client.config.has("primeiraVez")) require("./utilidades/primeiraVez")();

client.usuarios = new Enmap("usuarios");
client.relacionamentos = new Enmap("relacionamentos");
client.memes = new Enmap("memes");
client.autoCargos = new Enmap("autocargos");
client.nfs = new Enmap("nfs");

process.on("uncaughtException", (erro) => {
  client.log("critico", `Unhandled error: ${erro.stack}`);
});

require("./modulos/esquemas")();
require("./modulos/eventos")();
require("./modulos/comandos").carregar();

//* Conectar ao banco de dados e fazer login
mongoose.connect(process.env.MONGODB_URI, { keepAlive: true, dbName: "DreamHouseDB" })
  .then(() => {
    client.log("bot", "Fazendo login...");
    client.login(process.env.TOKEN);
  })
  .catch((erro) => {
    client.log("mongodb", `Não foi possível conectar ao banco de dados\n${erro.stack}`, "critico");
    process.exitCode = 1;
  });
