# AtvHelder-25-09## Sobre
📚 API da Biblioteca

API REST para gerenciar o acervo, os leitores e os empréstimos de uma biblioteca, feita com Node.js e Express. O projeto aplica regras de negócio reais de biblioteca: limite de empréstimos por leitor, prazo de devolução, redução de prazo por atraso e bloqueio automático de leitores com atraso longo.

Os dados ficam em memória: não há banco de dados, então tudo é perdido quando o servidor reinicia.

Sumário
Funcionalidades
Tecnologias
Como executar
Endpoints
Exemplos de uso
Regras de negócio
Estrutura do projeto
Limitações conhecidas
Próximos passos
Funcionalidades
Livros: cadastrar, listar, buscar por id, editar e excluir.
Leitores: cadastrar, listar e buscar por id.
Empréstimos: registrar, listar e devolver, com cálculo de atraso.
Regras automáticas: limite de 3 empréstimos ativos, prazo menor para quem devolveu com atraso e bloqueio de leitores com atraso prolongado.
Tecnologias
Node.js
Express 5
Como executar

Pré-requisito: Node.js instalado (recomendado a versão LTS mais recente).

bash
# 1. Clone o repositório
git clone https://github.com/Tiago12345-ultra/AtvHelder-25-09.git
cd AtvHelder-25-09

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start

O servidor sobe em http://localhost:3000. Para testar, acesse a raiz:

bash
curl http://localhost:3000/
# {"mensagem":"API da Biblioteca funcionando!"}
Endpoints
Geral
Método	Rota	Descrição
GET	/	Verifica se a API está no ar
Livros — /livros
Método	Rota	Descrição	Corpo (JSON)
GET	/livros	Lista todos os livros	—
POST	/livros	Cadastra um livro	titulo, autor
GET	/livros/:id	Busca um livro por id	—
PUT	/livros/:id	Edita título e autor	titulo, autor
DELETE	/livros/:id	Exclui um livro	—
Leitores — /leitores
Método	Rota	Descrição	Corpo (JSON)
GET	/leitores	Lista todos os leitores	—
POST	/leitores	Cadastra um leitor	nome, email
GET	/leitores/:id	Busca um leitor por id	—
Empréstimos — /emprestimos
Método	Rota	Descrição	Corpo (JSON)
GET	/emprestimos	Lista todos os empréstimos	—
POST	/emprestimos	Registra um empréstimo	leitorId, livroId
PUT	/emprestimos/:id/devolucao	Registra a devolução	dataDevolucao (opcional, formato ISO)
Códigos de resposta
Código	Quando acontece
200	Consulta, edição, exclusão ou devolução realizada
201	Recurso criado
400	Leitor já tem 3 empréstimos ativos, ou empréstimo já foi devolvido
403	Leitor bloqueado
404	Livro, leitor ou empréstimo não encontrado

Erros retornam um JSON no formato { "mensagem": "..." }.

Exemplos de uso
Cadastrar um livro
bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Dom Casmurro", "autor": "Machado de Assis"}'
json
{ "id": 1, "titulo": "Dom Casmurro", "autor": "Machado de Assis" }
Cadastrar um leitor
bash
curl -X POST http://localhost:3000/leitores \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria Silva", "email": "maria@email.com"}'
json
{ "id": 1, "nome": "Maria Silva", "email": "maria@email.com", "bloqueado": false }
Registrar um empréstimo
bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"leitorId": 1, "livroId": 1}'
json
{
  "id": 1,
  "leitorId": 1,
  "livroId": 1,
  "dataEmprestimo": "2026-11-06T20:00:00.000Z",
  "dataPrevistaDevolucao": "2026-11-13T20:00:00.000Z",
  "dataDevolucao": null
}
Devolver um livro
bash
# Devolução com a data de hoje
curl -X PUT http://localhost:3000/emprestimos/1/devolucao

# Ou informando uma data específica (útil para testar atrasos)
curl -X PUT http://localhost:3000/emprestimos/1/devolucao \
  -H "Content-Type: application/json" \
  -d '{"dataDevolucao": "2026-11-16T12:00:00.000Z"}'
json
{
  "id": 1,
  "leitorId": 1,
  "livroId": 1,
  "dataEmprestimo": "2026-11-06T20:00:00.000Z",
  "dataPrevistaDevolucao": "2026-11-13T20:00:00.000Z",
  "dataDevolucao": "2026-11-16T12:00:00.000Z",
  "diasAtraso": 3
}
Regras de negócio
Regra	Detalhe
Prazo padrão	Todo empréstimo tem prazo de 7 dias a partir da data do empréstimo.
Limite de empréstimos	Cada leitor pode ter no máximo 3 empréstimos ativos (ainda não devolvidos).
Prazo reduzido	Se a última devolução do leitor teve de 1 a 7 dias de atraso, o próximo empréstimo tem prazo de apenas 4 dias.
Cálculo de atraso	Na devolução, o atraso é a diferença em dias (arredondada para cima) entre a data prevista e a data de devolução. Devolução no prazo gera atraso 0.
Bloqueio de leitor	Se um empréstimo não devolvido passar de 7 dias úteis (segunda a sexta) após o prazo, o leitor é marcado como bloqueado: true.
Leitor bloqueado	Leitores bloqueados não conseguem novos empréstimos (resposta 403).

A verificação de bloqueio roda sempre que um novo empréstimo é solicitado.

Estrutura do projeto
.
├── package.json
└── src
    ├── server.js                       # Configuração do Express e registro das rotas
    ├── routes
    │   ├── livrosRoutes.js             # Rotas de /livros
    │   ├── leitoresRoutes.js           # Rotas de /leitores
    │   └── emprestimosRoutes.js        # Rotas de /emprestimos
    └── controllers
        ├── livrosController.js         # Lógica de livros
        ├── leitoresController.js       # Lógica de leitores
        └── emprestimosController.js    # Lógica de empréstimos e regras de negócio

O projeto segue a separação rotas → controllers: as rotas apenas associam cada URL a uma função, e os controllers concentram a lógica e guardam os dados em arrays em memória.

Limitações conhecidas
Sem persistência: os dados são perdidos ao reiniciar o servidor.
Sem validação de entrada: campos ausentes ou inválidos no corpo da requisição não geram erro.
IDs frágeis: o id é gerado como quantidade de itens + 1, então excluir um livro e cadastrar outro pode gerar ids repetidos.
Sem controle de disponibilidade: o mesmo livro pode ser emprestado a vários leitores ao mesmo tempo.
Bloqueio permanente: não existe rota para desbloquear um leitor.
Porta fixa: o servidor sempre usa a porta 3000.
