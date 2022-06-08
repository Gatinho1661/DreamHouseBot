const fg = require("fast-glob");

module.exports = () => {
  for (const arquivo of fg.sync("*.js", { cwd: client.dir + "/esquemas", baseNameMatch: true })) {
    try {
      //client.log("verbose", `Carregando esquema ${arquivo}...`)

      const modelo = require(client.dir + `/esquemas/${arquivo}`)();

      client.log("verbose", `Esquema foi carregado: ${modelo.name}`);
    } catch (err) {
      client.log("critico", `O esquema "${arquivo}" será ignorado\n${err.stack}`);
    }
  }
};
