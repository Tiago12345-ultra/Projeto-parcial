const express = require("express");
const {
  listarLeitores,
  cadastrarLeitor,
  buscarLeitor,
} = require("../controllers/leitoresController");

const router = express.Router();

router.get("/", listarLeitores);
router.post("/", cadastrarLeitor);
router.get("/:id", buscarLeitor);

module.exports = router;
