const { ObjectId } = require("mongodb");
const { obterBanco } = require("../config/banco");
const { formatarDocumento } = require("../utils/documento");

const colecao = () => obterBanco().collection("emprestimos");

async function inserir(dados) {
  const resultado = await colecao().insertOne(dados);
  return formatarDocumento({ _id: resultado.insertedId, ...dados });
}

async function buscarTodas(filtro = {}) {
  const documentos = await colecao().find(filtro).toArray();
  return documentos.map(formatarDocumento);
}

async function buscarPorId(id) {
  const documento = await colecao().findOne({ _id: new ObjectId(id) });
  return formatarDocumento(documento);
}

async function atualizar(id, dados) {
  const documento = await colecao().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: dados },
    { returnDocument: "after" }
  );
  return formatarDocumento(documento);
}

async function remover(id) {
  const resultado = await colecao().deleteOne({ _id: new ObjectId(id) });
  return resultado.deletedCount === 1;
}

module.exports = { inserir, buscarTodas, buscarPorId, atualizar, remover };
