const express = require("express");
const app = express();
app.use(express.json());

const livrosRoutes = require("./routes/livrosRoutes");
app.use("/livros", livrosRoutes);


app.get("/", (req, res) => {
res.json({ mensagem: "API da Biblioteca funcionando!" });});

app.listen(3000, () => {
console.log("Servidor rodando na porta 3000");});

const leitoresRoutes = require("./routes/leitoresRoutes");

app.use("/leitores", leitoresRoutes);