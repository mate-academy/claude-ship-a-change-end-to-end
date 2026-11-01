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
  1. The `validateId` middleware (see below) runs first. `parseId` accepts only plain positive decimal integers (`Number()` alone would let `1e2`, `0x10`, `1.5` or NaN through), and `isIdInRange` requires 1..`maxUserId`. Malformed ids get a 400 instead of a wrong lookup or a misleading 404.
  2. `validateUserInput` requires a non-empty string `name` and a valid `email` (checked with `validator.isEmail`), trims both, and tolerates a missing body. Failure is a 400 with a clear message.
  3. `store.updateUser` returns `undefined` for an unknown id, which the route turns into a 404 `User not found`.
  4. Success returns 200 with the updated user.
  Validating before the lookup means bad input always gets a 400, even if the id doesn't exist.
- Intended behavior changes to existing routes: `GET /users/:id` returns 400 for a malformed id (was 404), and `POST /users` now rejects non-string or whitespace-only names and invalid emails and trims values. Existing tests are unaffected.

## Follow-ups from review
A code review of the first six commits raised a few points, addressed in separate commits:
- `config.js` holds `maxUserId` (50000) and `idValidatedEndpoints`, shaped `{ METHOD: { "/route/:id": true } }`.
- `utils.isIdInRange` enforces the range; ids above it get "id is out of range", so `parseId` is format-only and huge digit strings no longer get a misleading message.
- Email validation now uses the `validator` package (`validator.isEmail`), rejecting `a@b`, `a@.`, `user@localhost`, `a..b@x.com`.
- `middleware/validateId.js` is a `router.param("id")` handler used for GET and PUT. It matches the method and route with two `Object.hasOwn` hash lookups (O(1), no scanning or regex), only validates listed endpoints, and sets `req.userId`. `Object.hasOwn` stops keys like `constructor` or `__proto__` from matching. This removed the duplicated inline id checks.
- `store.updateUser` throws a `TypeError` unless name and email are non-empty strings, so a direct caller passing `undefined` can't wipe a field.
- `CLAUDE.md` now describes this flow, so future routes use the middleware and add themselves to the endpoint map.

## Commit split
1. Ignore JetBrains `.idea/` directory.
2. Add `utils.js` with shared id and user-input helpers (only that file).
3. Use shared utils for id parsing and validation in user routes.
4. Add `updateUser` helper to the in-memory store.
5. Add `PUT /users/:id` endpoint.
6. Document the plan, logic and commits in `NOTES.md`.

Review follow-ups:
7. Add `config.js` with `maxUserId` and id-validated endpoints.
8. Add `isIdInRange` check to utils.
9. Add the `validator` dependency.
10. Use `validator.isEmail` for stricter email validation.
11. Add the `validateId` middleware with O(1) method/route matching.
12. Use the middleware for GET and PUT `/users/:id`.
13. Reject missing or invalid fields in `store.updateUser`.
14. Update `CLAUDE.md`.
15. Refresh `NOTES.md` (this commit).

## Review
- `npm run lint` clean and the full test suite passing.
- Manually checked `PUT /users/` with `abc`, `0`, `-1`, `1.5`, `01`, `1e2`, `0x10` and a huge number (all 400), `9999` (404) and `1` (200).
- After the follow-ups: lint and tests green after every commit, and a supertest script confirmed GET and PUT return 400 "positive integer" for `abc`/`0`/`01`/`1e2`, 400 "out of range" for `50001` and a 20-digit id, 404 for `9999` and 200 for `1`. A stub-`req` script confirmed the middleware skips unlisted methods and routes, and `constructor`/`__proto__` keys. `store.updateUser` throws on missing fields and leaves the user unchanged.
- Checked with `git show --stat` that each commit touches only its own file.
