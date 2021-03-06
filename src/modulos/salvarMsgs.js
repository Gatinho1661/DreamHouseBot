const { fetchAll } = require("./utils");

module.exports = async () => {
  const filtro = /https?:\/\/(www.)?([/|.|\w|-])*\.(?:jpg|jpeg|gif|png|webp)/;
  const canalFixadosId = client.config.get("fixados");
  const canalBichinhosId = client.config.get("bichinhos");

  //* Salvar todas as mensagens do canal de fixados
  const fixadosCanal = await client.channels.cache.get(canalFixadosId);
  if (fixadosCanal) {
    try {
      client.log("bot", "Buscando fixados...");
      let fixados = await fetchAll(fixadosCanal, {
        limiteReq: 25,
        apenasUsuario: true,
        invertido: true,
      });
      if (fixados === 0) return client.log("bot", "Nenhum fixado encontrado", "aviso");

      fixados = fixados.filter((fixado) => {
        return fixado.attachments.first()
          ? filtro.test(fixado.attachments.first().proxyURL)
          : false || filtro.test(fixado.content);
      });

      client.mensagens.set("fixados", fixados);
      client.log("bot", `${fixados.length} Fixados salvos`);
    } catch (err) {
      client.log("erro", err.stack);
      client.log("bot", "Ocorreu um erro ao salvar as mensagens dos fixados", "erro");
    }
  } else {
    client.log("bot", "Canal de fixados não encontrado", "erro");
  }

  //* Salvar todas as mensagens do canal de bichinhos
  const bichinhosCanal = await client.channels.cache.get(canalBichinhosId);
  if (bichinhosCanal) {
    try {
      client.log("bot", "Buscando bichinhos...");
      let bichinhos = await fetchAll(bichinhosCanal, {
        limiteReq: 25,
        apenasUsuario: true,
        invertido: true,
      });
      if (bichinhos === 0) return client.log("bot", "Nenhum bichinho encontrado", "aviso");

      bichinhos = bichinhos.filter((bichinho) => {
        return bichinho.attachments.first()
          ? filtro.test(bichinho.attachments.first().proxyURL)
          : false || filtro.test(bichinho.content);
      });

      client.mensagens.set("bichinhos", bichinhos);
      client.log("bot", `${bichinhos.length} Bichinhos salvos`);
    } catch (err) {
      client.log("erro", err.stack);
      client.log("bot", "Ocorreu um erro ao salvar as mensagens dos bichinhos", "erro");
    }
  } else {
    client.log("bot", "Canal de bichinhos não encontrado", "erro");
  }
};
