I chose opusplan in order to have the better model opus getting the planning and the cheaper model sonnet to execute the tasks

The summary plan of changes:
```
Summary:
- db/store.js: added updateUser(id, {name, email}) — reuses getUserById, returns undefined if not found.
- routes/users.js: added PUT /:id — validates first (400), then looks up/updates (404 if missing), 200 with the updated user otherwise.
- Committed as two logical commits on feature/update-user-endpoint: the store helper, then the route.
- npm test: 9/9 green. npm run lint: clean.
```

Code review:
```
Code review finished — clean, no findings.

The reviewer traced all callers, checked cross-file consistency with existing conventions, re-ran the test suite (9/9 pass) and lint (clean), and manually verified the body-less-PUT edge case (400, no crash). No correctness bugs, no cleanup issues, no CLAUDE.md convention violations.
```

The PR comment:
```
## What

Adds the "update a user" endpoint: `PUT /users/:id`.

- `db/store.js`: new `updateUser(id, { name, email })` helper — the only piece that touches the in-memory `users` array, following the existing `getAllUsers` / `getUserById` / `createUser` pattern. Reuses `getUserById` for the lookup and returns `undefined` when the id isn't found.
- `routes/users.js`: new `router.put("/:id", ...)` handler — validates `name` and `email` are present (400 if not), looks up/updates via the store (404 if the user doesn't exist), otherwise 200 with the updated user. Mirrors the validation and error-shape conventions already used by `GET /:id` and `POST /`.

## Why

This is the project's target change — `tests/update-user.test.js` (already in the repo, not modified) was red because the endpoint didn't exist yet.

## What to test

- `npm test` — all 9 tests pass, including the three in `tests/update-user.test.js`:
  - `PUT /users/:id` updates an existing user → 200 with the new `name`/`email`
  - `PUT /users/:id` on an unknown id → 404
  - `PUT /users/:id` with a missing field → 400
- `npm run lint` — clean
- Manually: start the server and hit `PUT /users/1` with a full body (200, persists), an unknown id (404 `{"error":"User not found"}`), and a partial body (400 `{"error":"name and email are required"}`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```