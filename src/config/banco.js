const { MongoClient } = require("mongodb");

let client = null;
let db = null;

async function conectar() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const nomeDoBanco = process.env.MONGODB_DB_NAME;

  if (!uri || !nomeDoBanco) {
    throw new Error("Defina MONGODB_URI e MONGODB_DB_NAME no arquivo .env.");
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(nomeDoBanco);
  return db;
}

function obterBanco() {
  if (!db) {
    throw new Error("Banco não conectado. Chame conectar() antes de usar os models.");
  }
  return db;
}

async function desconectar() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
}

module.exports = { conectar, obterBanco, desconectar };
