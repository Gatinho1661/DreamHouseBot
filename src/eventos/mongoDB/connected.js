const mongoose = require("mongoose");

// Emitido quando o bot conecta ao banco de dados
module.exports = {
  nome: "connected",
  once: true, // Se deve ser executado apenas uma vez
  origem: mongoose.connection,

  async executar() {
    client.log("mongodb", `Conectado ao banco de dados ${mongoose.connection.name}`);
  }
};