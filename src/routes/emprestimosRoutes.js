const express = require("express");

const router = express.Router();

const {
  listarEmprestimos,
  cadastrarEmprestimo,
  devolverEmprestimo
} = require("../controllers/emprestimosController");

router.get("/", listarEmprestimos);
router.post("/", cadastrarEmprestimo);
router.put("/:id/devolucao", devolverEmprestimo);

module.exports = router;