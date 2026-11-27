const express = require("express");
const {
  listarEmprestimos,
  cadastrarEmprestimo,
  devolverEmprestimo,
} = require("../controllers/emprestimosController");

const router = express.Router();

router.get("/", listarEmprestimos);
router.post("/", cadastrarEmprestimo);
router.put("/:id/devolucao", devolverEmprestimo);

module.exports = router;
