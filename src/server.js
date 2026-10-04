const express = require("express");

const app = express();

app.use(express.json());

const livrosRoutes = require("./routes/livrosRoutes");
const leitoresRoutes = require("./routes/leitoresRoutes");
const emprestimosRoutes = require("./routes/emprestimosRoutes");

app.use("/livros", livrosRoutes);
app.use("/leitores", leitoresRoutes);
app.use("/emprestimos", emprestimosRoutes);
app.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca funcionando!" });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});