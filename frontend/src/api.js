
const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message, status, statusText) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
  }
}

async function requisicao(caminho, opcoes = {}) {
  const config = {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...opcoes.headers,
    },
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const resposta = await fetch(`${BASE_URL}${caminho}`, config);

  if (!resposta.ok) {
    throw new ApiError(
      `Erro na requisição: ${resposta.status}`,
      resposta.status,
      resposta.statusText
    );
  }

  if (resposta.status === 204) return null;

  return resposta.json();
}

export const apiGet = (caminho, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: "GET" });

export const apiPost = (caminho, dados, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: "POST", body: dados });

export const apiPut = (caminho, dados, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: "PUT", body: dados });

export const apiDelete = (caminho, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: "DELETE" });
