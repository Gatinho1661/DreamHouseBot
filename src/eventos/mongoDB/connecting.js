const mongoose = require("mongoose");

// Emitido quando o bot conecta ao banco de dados
module.exports = {
  nome: "connecting",
  once: true, // Se deve ser executado apenas uma vez
  origem: mongoose.connection,

  async executar() {
    client.log("mongodb", "Conectando ao banco de dados...");
  }
};