require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { conectar } = require("./config/banco");
const { ErroHttp } = require("./utils/erros");

const livrosRoutes = require("./routes/livrosRoutes");
const leitoresRoutes = require("./routes/leitoresRoutes");
const emprestimosRoutes = require("./routes/emprestimosRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca funcionando!" });
});

app.use("/livros", livrosRoutes);
app.use("/leitores", leitoresRoutes);
app.use("/emprestimos", emprestimosRoutes);

app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  if (err instanceof ErroHttp) {
    return res.status(err.status).json({ mensagem: err.message });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ mensagem: "Corpo da requisição não é um JSON válido" });
  }

  console.error(err);
  res.status(500).json({ mensagem: "Erro interno do servidor" });
});

const PORTA = Number(process.env.PORT) || 3000;

async function iniciar() {
  try {
    await conectar();
    console.log("Conectado ao MongoDB");

    app.listen(PORTA, () => {
      console.log(`Servidor rodando na porta ${PORTA}`);
    });
  } catch (erro) {
    console.error("Falha ao iniciar a aplicação:", erro.message);
    process.exit(1);
  }
}

iniciar();
