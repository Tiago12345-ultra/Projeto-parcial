
const express = require("express");

const router = express.Router();

const {
  listarEmprestimos,
  cadastrarEmprestimo,
  devolverEmprestimo,
  listarHistoricoLeitor
} = require("../controllers/emprestimosController");

router.get("/", listarEmprestimos);
router.get("/leitor/:id", listarHistoricoLeitor);
router.post("/", cadastrarEmprestimo);
router.put("/:id/devolucao", devolverEmprestimo);

module.exports = router;
