# CLAUDE.md

Small Express API used across the Claude Code course projects. In-memory data store,
tests via `node --test` + `supertest`.

- `server.js` — builds `app`, mounts `routes/users` at `/users` and `routes/health` at `/health`
- `routes/users.js` — users resource, one handler per action, goes through `db/store.js`
- `db/store.js` — in-memory data helper (no persistence; resets on restart)
- `tests/` — `node --test` suite; `npm test` runs everything

## Current task — ship the "update a user" endpoint

Add `PUT /users/:id` until `tests/update-user.test.js` is green.

### Diagnosis (verified)

- [x] `npm install` run, `npm test` executed — baseline: 5 pass, 4 fail
- [x] `tests/update-user.test.js` requires: update existing user → `200` + updated body;
      unknown id → `404`; missing field → `400`
- [x] Root cause: no `PUT` route in `routes/users.js`, no update helper in `db/store.js`.
      The "404 for unknown user" test only passes by accident (Express 404s unrouted paths)

### Step 1 — `db/store.js`: add `updateUser`

- [x] Add `updateUser(id, { name, email })` — reuses `getUserById`, returns `null` if
      not found, else updates `name`/`email` and returns the user
- [x] Export `updateUser` in `module.exports`

### Step 2 — `routes/users.js`: add `PUT /:id`

- [x] Add `router.put("/:id", ...)` after the `POST /` handler (commit `8690fdb`)
- [x] Validate first: `if (!name || !email)` → `400 { error: "name and email are required" }`
      (commit `f411ad1`)
- [x] Then `store.updateUser(...)` → `null` → `404 { error: "User not found" }`
- [x] Else `res.json(user)` → `200`
- Decisions: validation (400) before not-found (404); full-replace PUT semantics
  (both fields required); non-numeric/unknown id → `404`, no crash; error strings
  match the existing route

Built one logical change per commit so each fixed one failing test at a time:
- `8690fdb` route (update + 404) → `updates an existing user` went green
- `f411ad1` presence validation → `missing field returns 400` went green
- `1d79d4a` email-format validation → from self-review (see below)

### Verification

- [x] `npm test` after route commit — 8 pass / 1 fail (`missing field` still 200)
- [x] `npm test` after validation commit — 9 pass / 0 fail, full suite green
- [ ] `npm test` after email-format commit — expect 9 pass / 0 fail (pending user run)
- [x] `tests/users.test.js` and health test still pass
- [x] `tests/notes.test.js` — passes now that `NOTES.md` exists with real content

### Self-review (Task 5)

- [x] Reviewed the full diff before opening the PR
- [x] Caught: `PUT /users/:id` validated field presence only, not email format —
      `"grace@"` would be stored. Fixed in `1d79d4a` (`EMAIL_PATTERN` → 400).
- [x] Confirmed fine: validation-before-lookup order, `NaN` id → 404, error-string
      consistency with existing routes

### NOTES.md

- [x] `NOTES.md` created and completed — plan, model choice, commit split, review

### Out of scope

`README.pt-BR.md` kept local (in `.gitignore`). `POST /users` left with its
presence-only check to keep this PR scoped to the new endpoint.
