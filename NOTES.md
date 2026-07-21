# Notes: PUT /users/:id

## Plan
Add an "update user" endpoint that mirrors the existing GET/POST patterns in
this codebase:
1. Add an `updateUser(id, { name, email })` helper to `db/store.js` that
   looks up the user, returns `null` if it doesn't exist, and otherwise
   mutates and returns it.
2. Add a `PUT /:id` route to `routes/users.js` that validates `name` and
   `email` are present (400 if not), calls `store.updateUser`, and returns
   404 if no user was found or 200 with the updated user otherwise.
3. Run `npm test` (tests/update-user.test.js) to confirm the 200/404/400
   cases all pass.

## Model choice
Used Sonnet 5 for this task. The change is a small, well-scoped CRUD
addition that follows an established pattern already present in the file
(GET /:id and POST / do the same lookup/validate/respond shape), so it
didn't need heavier extended reasoning — just careful pattern-matching and
running the tests to confirm correctness.

## Commit split
Single commit covering both `db/store.js` (new `updateUser` helper) and
`routes/users.js` (new `PUT /:id` route), since the two changes only make
sense together and are small enough that splitting them would add noise
without any review benefit.

## Review
Checked ordering of the 400 vs 404 checks: the missing-field test PUTs to
`/users/1`, an id that exists in the seed data, but omits `email`. Validation
runs before the store lookup, so that case correctly returns 400 rather than
skipping straight to a 404-free update. Also confirmed the update mutates
the existing user object in place rather than replacing it, keeping behavior
consistent with the in-memory store's other helpers.
