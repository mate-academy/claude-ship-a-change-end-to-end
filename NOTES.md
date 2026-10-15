# Model:
I use Sonnet model

# Changes: Add PUT /users/:id endpoint

Added an update-user endpoint to the users resource following the existing patterns in the codebase.

**`db/store.js`** — added `updateUser(id, { name, email })`: locates the user by id using `findIndex`, returns `undefined` if not found, otherwise replaces the record in-place and returns the updated user. Exported alongside the existing store methods.

**`routes/users.js`** — added `PUT /users/:id` handler: converts the `:id` param to a number, rejects requests missing `name` or `email` with a 400 error, calls `store.updateUser` and returns 404 if the user doesn't exist, otherwise responds with the updated user object and a 200 status.
