const express = require("express");
const router = express.Router();

const {
listarLivros,
cadastrarLivro,
buscarLivro,
editarLivro,
excluirLivro
} = require("../controllers/livrosController");

router.get("/", listarLivros);
router.post("/", cadastrarLivro);
router.get("/:id", buscarLivro);
router.put("/:id", editarLivro);
router.delete("/:id", excluirLivro);
module.exports = router;