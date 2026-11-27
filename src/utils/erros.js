class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = "ErroHttp";
    this.status = status;
  }
}

module.exports = { ErroHttp };
