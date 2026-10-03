const express = require("express");
const router = express.Router();

const {
  listarLeitores,
  cadastrarLeitor,
  buscarLeitor
} = require("../controllers/leitoresController");

router.get("/", listarLeitores);
router.post("/", cadastrarLeitor);
router.get("/:id", buscarLeitor);

module.exports = router;