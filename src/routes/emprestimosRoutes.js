const express = require("express");

const router = express.Router();

const {
  listarEmprestimos,
  cadastrarEmprestimo
} = require("../controllers/emprestimosController");

router.get("/", listarEmprestimos);
router.post("/", cadastrarEmprestimo);

module.exports = router;