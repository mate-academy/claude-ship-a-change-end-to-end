I used opusplan model.

## Plan
Planned in plan mode first, then implemented one feature at a time with a commit after each.

## Model
opusplan: Opus for planning, Sonnet for implementation.

## What was done
- `.gitignore`: ignore the JetBrains `.idea/` folder.
- `utils.js`: shared pure helpers (`parseId`, `isNonEmptyString`, `isValidEmail`, `validateUserInput`).
- `routes/users.js`: GET and POST switched to the shared helpers.
- `db/store.js`: new `updateUser(id, { name, email })`.
- `routes/users.js`: new `PUT /users/:id`.
- This `NOTES.md`.

## Logic
- Helpers live in `utils.js` because they are pure and shared by several handlers. Data access stays in `db/store.js`, as the project requires.
- `PUT /users/:id` runs in this order:
  1. `parseId` accepts only plain positive decimal integers. `Number()` alone would let `1e2` (100), `0x10` (16), `1.5` or NaN through, so malformed ids get a 400 instead of a wrong lookup or a misleading 404.
  2. `validateUserInput` requires a non-empty string `name` and a valid `email`, trims both, and tolerates a missing body. Failure is a 400 with a clear message.
  3. `store.updateUser` returns `undefined` for an unknown id, which the route turns into a 404 `User not found`.
  4. Success returns 200 with the updated user.
  Validating before the lookup means bad input always gets a 400, even if the id doesn't exist.
- Intended behavior changes to existing routes: `GET /users/:id` returns 400 for a malformed id (was 404), and `POST /users` now rejects non-string or whitespace-only names and invalid emails and trims values. Existing tests are unaffected.

## Commit split
1. Ignore JetBrains `.idea/` directory.
2. Add `utils.js` with shared id and user-input helpers (only that file).
3. Use shared utils for id parsing and validation in user routes.
4. Add `updateUser` helper to the in-memory store.
5. Add `PUT /users/:id` endpoint.
6. Document the plan, logic and commits in `NOTES.md`.

## Review
- `npm run lint` clean and the full test suite passing.
- Manually checked `PUT /users/` with `abc`, `0`, `-1`, `1.5`, `01`, `1e2`, `0x10` and a huge number (all 400), `9999` (404) and `1` (200).
- Checked with `git show --stat` that each commit touches only its own file.
