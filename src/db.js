import Enmap from "enmap"
import primeiraVez from "./utilidades/primeiraVez.js";

client.config = new Enmap({ name: "config" });
if (!client.config.has("primeiraVez")) primeiraVez();

client.usuarios = new Enmap({ name: "usuarios" });
client.relacionamentos = new Enmap({ name: "relacionamentos" });
client.memes = new Enmap({ name: "memes" });
client.autoCargos = new Enmap({ name: "autocargos" });
client.nfs = new Enmap({ name: "nfs" });
