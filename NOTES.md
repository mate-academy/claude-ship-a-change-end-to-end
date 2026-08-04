# NOTES

## El plan

Antes de escribir código, Claude leyó `routes/users.js`, `db/store.js` y
`tests/update-user.test.js`, y ejecutó `npm test` para confirmar el estado real (en lugar de
fiarse del resumen que yo había dado). Eso corrigió un dato: había reportado que
"`NOTES.md exists at the project root` pasa", pero en realidad fallaba porque el archivo no
existía en absoluto — solo el test de contenido tenía sentido reportarlo como "falla" antes de
que se corrigiera. También notó que el 404 de `PUT /users/9999` pasaba por un falso positivo
(no existía la ruta, así que Express devolvía 404 por defecto, no por lógica implementada).

El plan aprobado fue:
- añadir `updateUser(id, {name, email})` en `db/store.js`, reutilizando `getUserById` y
  devolviendo `undefined` si no existe, igual que ya hace `getUserById`;
- añadir `router.put("/:id", ...)` en `routes/users.js` que valide `name`/`email` como strings
  no vacíos (400 si fallan), delegue en `store.updateUser`, y devuelva 404 si no existe;
- escribir este `NOTES.md`.

Se validaron dos decisiones con preguntas explícitas antes de tocar código: trabajar en una
rama nueva (`feat/update-user-endpoint`) en vez de commitear directo en `main`, y el nivel de
validación de entrada (igual que `POST /users` más rechazo de campos vacíos tras `trim()`, sin
añadir validación de formato de email que `POST` tampoco tiene). No hubo más ediciones al plan
antes de aprobarlo.

## Modelo elegido

Claude Opus 5, por ser el modelo por defecto disponible en esta sesión de Claude Code y por
tratarse de un cambio pequeño pero con varios casos de borde (404 real vs. accidental, orden
validación/not-found, mutación en memoria) donde vale la pena razonamiento cuidadoso sobre las
pruebas antes de tocar código.

## División de commits

Tres commits, cada uno una capa distinta y verificado con `npm test` antes de pasar al
siguiente:

1. `Add updateUser helper to the in-memory store` — solo `db/store.js`. Aislado: en este punto
   el helper no lo usa nadie, así que la suite queda igual que al inicio (sin regresiones).
2. `Add PUT /users/:id with validation and not-found handling` — solo `routes/users.js`. Aquí
   los tres tests de `update-user.test.js` pasan a verde.
3. `Add NOTES.md with plan, model choice, commit split and review` — solo este archivo.

El criterio fue dependencia primero (capa de datos → ruta → documentación), para que el árbol
nunca quede en un estado donde una ruta llame a una función que no existe todavía, y para que
cada commit sea revisable de forma independiente.

## Qué confirmó/detectó la revisión

- Confirmó que el orden "validar entrada antes de buscar el usuario" es correcto: el test de
  400 usa el id `1` (que existe) y el de 404 usa un body válido, así que cualquier orden pasa
  los tests, pero validar primero evita tocar el store con datos basura.
- Confirmó que un `id` en el body no puede alterar el id del recurso, porque `updateUser` nunca
  desestructura `id` del segundo argumento.
- Confirmó que un id no numérico en la URL (`PUT /users/abc`) cae en `NaN`, `getUserById` no
  encuentra nada, y responde 404 sin crashear — mismo comportamiento que ya tenía
  `GET /users/:id`.
- Confirmó que el mensaje de error 400 (`"name and email are required"`) es idéntico al que ya
  usa `POST /users`, para no introducir inconsistencias en la API.
- No se detectaron bugs que corregir tras escribir el código: `npm test` quedó en verde en el
  primer intento tras el commit de la ruta.
