# Project Notes — PUT /users/:id

## Plan
Implement the `PUT /users/:id` endpoint to update an existing user. The work was split into two layers: the store and the route.

## Model
Claude Sonnet 4.6 (claude-sonnet-4-6) via Claude Code.

## Commit split
1. `feat(store): add updateUser method` — added `updateUser(id, { name, email })` to `db/store.js`. Finds the user by id, mutates name and email in place, returns the updated object or null if not found.
2. `feat(routes): add PUT /users/:id endpoint` — added the route to `routes/users.js`. Validates that both fields are present (400), calls `store.updateUser`, returns 404 if the store returns null, otherwise 200 with the updated user.

## Review
Validation order matters: the 400 check runs before the store call, matching the test expectations. The store mutates the object in place since the in-memory array holds object references — no need to splice and re-insert.
