const express = require("express");

const router = express.Router();

const {
  listarEmprestimos
} = require("../controllers/emprestimosController");

router.get("/", listarEmprestimos);

module.exports = router;