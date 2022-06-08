const mongoose = require("mongoose");

module.exports = () => {

  const relacao = new mongoose.Schema(
    {
      idConjuge: { type: mongoose.SchemaTypes.ObjectId, default: null, ref: "Usuario" },
      nomeConjuge: { type: String, default: null },
      dataCasamento: { type: Date, default: null },
      amantes: [{ type: mongoose.SchemaTypes.ObjectId, default: null, ref: "Usuario" }],
    },
    {
      _id: false,
      toObject: { virtuals: true },
      toJSON: { virtuals: true }
    }
  );

  const usuario = new mongoose.Schema(
    {
      _id: { type: mongoose.SchemaTypes.ObjectId, default: new mongoose.Types.ObjectId() },
      __metadados: {},
      contas: [String],
      nome: { type: String, default: null, required: true },
      dataNascimento: { type: Date, default: null },
      idade: { type: Number, default: null },
      orientacao: { type: String, default: null },
      pronomes: [String],
      relacao: { type: relacao, default: () => ({}) },
    },
    {
      minimize: false,
      optimisticConcurrency: true,
      versionKey: "__metadados.versao",
      timestamps: { createdAt: "__metadados.criado_em", updatedAt: "__metadados.atualizado_em" }
    }
  );

  usuario.index({ "contas": 1 }, { unique: true });

  relacao.virtual("conjuge", {
    ref: "Usuario",
    localField: "idConjuge",
    foreignField: "_id",
    justOne: true
  });

  usuario.virtual("contaPrincipal")
    .get(function () {
      return this.contas[0];
    })
    .set(function (contaId) {
      if (this.contas.includes(contaId)) {
        // Mover conta para o inicio da array
        const contas = this.contas.filter(c => c !== contaId);
        contas.unshift(contaId);

        this.contas = contas;
      } else {
        // Adicionar conta no inicio da array
        this.contas.unshift(contaId);
      }
    });

  relacao.methods.casar = async function (conjuge) {
    //TODO Remover de amantes se tiver
    const dataCasamento = new Date();

    this.relacao.idConjuge = new mongoose.Types.ObjectId(conjuge.id);
    this.relacao.nomeConjuge = conjuge.nome;
    this.relacao.dataCasamento = dataCasamento;

    console.log(this.relacao);

    conjuge.relacao.idConjuge = new mongoose.Types.ObjectId(this.id);
    conjuge.relacao.nomeConjuge = this.nome;
    conjuge.relacao.dataCasamento = dataCasamento;

    console.log(conjuge.relacao);

    return this.bulkSave([this, conjuge]);
  };

  return mongoose.model("Usuario", usuario);
};