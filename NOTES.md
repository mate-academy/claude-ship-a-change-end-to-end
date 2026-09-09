# NOTES

## Plano aprovado

O Claude Code foi colocado em modo "plan", analisou o problema (endpoint
`PUT /users/:id` ausente, testes de `tests/update-user.test.js` vermelhos) e propôs um
plano de correção em dois passos: adicionar o helper `updateUser` em `db/store.js` e a
rota `PUT /:id` em `routes/users.js`, com validação `400` antes da checagem de
`404`. Pedi que ele registrasse tudo em um `CLAUDE.md` e fosse marcando um check a cada
etapa concluída.

## Escolha do modelo

Modelo escolhido: **Sonnet 5**. A tarefa é pequena e bem delimitada (um endpoint CRUD
seguindo padrões já existentes no repositório), então o Sonnet 5 dá a relação
custo/velocidade/qualidade certa, sem precisar de um modelo mais pesado.

## Revisão do plano

Li o plano proposto e ele cobre todos os requisitos da tarefa: atualiza um usuário
existente (`200`), retorna `404` para id inexistente a partir da nossa própria lógica
(e não pelo 404 acidental do Express), e retorna `400` quando um campo obrigatório
está ausente, sempre passando por `db/store.js` e seguindo o padrão das rotas
existentes. Com isso, aprovei o plano.
