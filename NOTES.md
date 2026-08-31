# NOTES

## El plan

El plan cubría dos archivos: agregar un helper `updateUser(id, { name, email })`
en `db/store.js` (siguiendo la misma forma que `getUserById`/`createUser`, devolviendo
`undefined` cuando el id no existe) y agregar `router.put("/:id", ...)` en
`routes/users.js`, reutilizando el mismo patrón de validación 400 que ya usa
`POST /` y el mismo patrón de 404 que ya usa `GET /:id`. También definía el orden
entre validación y búsqueda: valida el body primero (400) antes de tocar el store,
así el caso "body inválido + id inexistente" es determinístico. Aprobé el plan tal
cual, sin ediciones — coincidía con lo que pedían los tests y con el estilo que ya
tenía el resto de `routes/users.js`, así que no había nada que ajustar.

## Modelo

Usé Claude Sonnet 5. Es un cambio CRUD chico y bien acotado que reutiliza patrones
que ya existen dos veces en el mismo archivo (`GET /:id` para el 404, `POST /` para
el 400) — no requiere razonamiento profundo ni decisiones arquitectónicas, así que
un modelo rápido y capaz alcanza sin necesidad de un modelo más pesado.

## Commits

Los separé en dos commits lógicos:

1. `db/store.js` — el helper `updateUser` (la capa de datos).
2. `routes/users.js` — la ruta `PUT /:id` que lo consume.

La idea es que cada commit sea revisable por separado: el primero se entiende solo
mirando cómo se comporta el store, el segundo se entiende solo mirando cómo la ruta
usa ese store. (De hecho al principio los agregué juntos sin querer en un solo commit
y el mensaje solo describía la mitad del diff — lo deshice con `git reset --soft` y
los separé antes de seguir, ya que nada se había pusheado todavía.)

## Qué encontró la revisión

Antes de abrir el PR revisé el diff completo a mano y con `npm run lint`:

- Un `id` no numérico en la URL (`Number("abc")` → `NaN`) no rompe nada: la
  comparación estricta en `getUserById` nunca matchea `NaN`, así que cae
  naturalmente en 404 sin necesitar un chequeo especial.
- El body no puede pisar el `id` del usuario porque la ruta solo desestructura
  `name` y `email` del body; el `id` siempre viene del parámetro de la URL.
- Confirmé que el orden validación-antes-que-store es el que pide el test de 400
  (`PUT /users/1` con un campo faltante) sin necesidad de tocar el 404.
- No agregué validación de formato de email (regex, etc.) porque `POST /` tampoco
  la tiene — mantener el mismo nivel de validación que el resto del recurso evita
  inconsistencias y no lo pedía ni el enunciado ni los tests.
- `npm run lint` y `npm test` quedaron en verde sin cambios adicionales.
