# Notes — PUT /users/:id

## Plan

Leí `tests/update-user.test.js` para saber exactamente qué exigía el endpoint (200 al
actualizar, 404 si el usuario no existe, 400 si falta un campo) y miré `routes/users.js`
y `db/store.js` para seguir el mismo patrón que ya usan `GET /:id` y `POST /`. El plan
propuesto tenía tres pasos:

1. Agregar `updateUser(id, { name, email })` en `db/store.js`, que busca el usuario con
   `getUserById`, devuelve `undefined` si no existe, y si existe le actualiza `name` y
   `email` y lo retorna.
2. Agregar `router.put("/:id", ...)` en `routes/users.js`: valida `name`/`email` (400 si
   falta alguno, mismo mensaje que `POST`), llama a `store.updateUser`, devuelve 404 si
   no existe, 200 con el usuario si existe.
3. Correr `npm test` para confirmar que los tests de `update-user.test.js` quedaban en
   verde.

Aprobé el plan tal cual, sin cambios — encajaba directo con el patrón existente en el
resto de las rutas.

## Modelo

Usé Claude Sonnet 5. Para un cambio chico y bien acotado como este (una función de store
y un handler de ruta, ambos calcados de código ya existente en el repo), no hacía falta
un modelo más pesado — Sonnet 5 dio un buen balance entre calidad y velocidad para seguir
un patrón ya establecido.

## Commits

Separé el cambio en dos commits lógicos:

1. `Add updateUser to db/store.js` — el helper de acceso a datos.
2. `Add PUT /users/:id endpoint` — la ruta que lo consume.

Los separé porque son responsabilidades distintas (capa de datos vs. capa de ruta) y
porque así, si algo falla, es más fácil ver en qué capa está el problema con `git bisect`
o simplemente leyendo el historial.

## Revisión

Pedí una revisión de código sobre el diff completo (`db/store.js` + `routes/users.js`).
No encontró bugs, casos límite sin cubrir, ni problemas en el camino de "not found" o en
la validación: el código sigue el mismo patrón que ya usan `GET /:id` y `POST /`
(mismo estilo de validación, misma forma de buscar por id con `Number(req.params.id)`,
mismo estilo de mutar-y-retornar en el store). La revisión confirmó que el enfoque
calcado del código existente era el correcto, sin necesidad de cambios.
