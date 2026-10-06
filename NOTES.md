# Notes

## Plan
Add `PUT /users/:id` to update an existing user, following the existing
route -> store pattern.

- `db/store.js`: new `updateUser(id, { name, email })`. Returns the updated
  user, or `undefined` if the id doesn't exist (mirrors `getUserById`).
- `routes/users.js`: new `PUT /:id` handler. All data access goes through the
  store; the route only validates and shapes responses.

## Choices
- **Full replacement semantics (PUT):** both `name` and `email` are required,
  matching `POST /users`. A missing field is a 400, not a partial update.
- **Validation (400, `{ error }` with a clear message):**
  - `id` must be a positive integer.
  - `name` and `email` must be non-empty strings (whitespace-only rejected).
  - `email` must look like an email (`x@y.z`). Deliberately simple regex.
  - All body problems are reported together in one message, joined by `; `.
  - Values are trimmed before being stored.
- **Not found (404):** `{ "error": "User not found" }`, same text as
  `GET /users/:id`.
- **Order of checks:** validate id and body first, then look up the user, so
  malformed requests get 400 regardless of whether the user exists.
- Error shape stays `{ error: "..." }` to match existing endpoints.
- Store mutates the user object in place, consistent with the in-memory store.
  `id` can never be changed.

## Testing
Ran `npm test`: all 9 tests pass. Tests in `tests/update-user.test.js`
cover success, 404 and missing-field 400.

## Not done
- No uniqueness check on email (the existing POST doesn't have one either).
