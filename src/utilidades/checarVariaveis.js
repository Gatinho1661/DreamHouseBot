module.exports = () => {
  if (!process.env.TOKEN) {
    throw new Error("Variável de ambiente \"TOKEN\" não definida, "
      + "coloque o token do bot nessa variável");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Variável de ambiente \"MONGODB_URI\" não definida, "
      + "coloque a URI do MongoDB nessa variável");
  }

  if (!process.env.PREFIXO) {
    throw new Error("Variável de ambiente \"PREFIXO\" não definida, "
      + "coloque o prefixo do bot nessa variável");
  }

  if (!process.env.OPEN_WEATHER_API_KEY) {
    console.warn("Variável de ambiente \"OPEN_WEATHER_API_KEY\" não definida");
  }
};
