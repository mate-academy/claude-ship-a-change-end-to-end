# NOTES: endpoint `PUT /users/:id`

## Plan
Planifiqué el cambio en modo plan antes de tocar código. El plan aprobado incluía:
- Un helper `updateUser(id, { name, email })` en `db/store.js` que reutiliza `getUserById`, modifica el objeto existente sin cambiar su `id` y devuelve `undefined` si el usuario no existe.
- Una ruta `PUT /:id` en `routes/users.js` con este orden: primero valida la entrada (400), después busca el usuario en el store (404) y al final responde 200 con el usuario actualizado.
- Validación: `name` y `email` son obligatorios porque `PUT` reemplaza el recurso completo. Los dos deben ser texto no vacío (sin contar espacios) y el email debe contener `@`.
- Mantener las convenciones que ya tenía la API: los ids no numéricos devuelven 404 como en `GET /:id`, y los mensajes de error son los mismos (`"User not found"`, `"name and email are required"`).

Aprobé el plan sin cambios. Ya cubría el 404, el 400 y el acceso a datos a través del store, que es lo que piden los tests.

## Modelo
Usé **Claude Opus 5.5**. El cambio es pequeño, pero el proyecto pide planificar, revisar y explicar las decisiones, y quería el modelo más capaz para detectar casos extremos en la revisión. En un cambio tan acotado, el coste extra no importa.

## Commits
Dividí el trabajo en un commit por cambio lógico:
1. `Añadir updateUser al store en memoria`: solo la capa de datos.
2. `Añadir endpoint PUT /users/:id con validación y 404`: la ruta HTTP. Con este commit pasan los tests del endpoint.
3. `Añadir NOTES.md ...`: la documentación.

Así cada commit se entiende sin abrir el diff, y la capa de datos y la capa HTTP se pueden revisar o revertir por separado.

## Revisión
Antes del push revisé el diff y probé a mano estos casos: un usuario existente (200), un id inexistente (404), un id no numérico (404), un campo que falta, un texto vacío o solo con espacios, un `name` que no es texto, un email sin `@` y un cuerpo vacío (todos 400). También comprobé que los campos extra como `id` o `role` se ignoran y no sobrescriben el id.

La revisión no encontró bugs. Dejé dos cosas fuera de alcance a propósito:
- No se comprueba si el email está duplicado, igual que en `POST /users`.
- El mensaje "name and email are required" también aparece cuando el campo existe pero no es texto.
