// Emitido quando o canal de voz fica vazio
module.exports = {
  nome: "empty",
  once: false, // Se deve ser executado apenas uma vez
  origem: client.distube,

  async executar(filaMusicas) {
    client.log("musica", `Canal vazio em: ${filaMusicas.voiceChannel?.name}`);
  }
};