# NOTES.md

## Plan

I planned the `PUT /users/:id` endpoint in plan mode before writing any code. The plan called for two additive changes: an `updateUser(id, { name, email })` helper in `db/store.js` that mirrors `getUserById`'s lookup and mutates the found user in place, and a `router.put("/:id", ...)` handler in `routes/users.js` that validates `name`/`email` with the same truthy check `POST /` already uses, then treats the store's `undefined` return as a 404. I didn't edit anything before approving — the plan already matched the existing GET/POST patterns, handled the non-numeric-id case correctly (falls through to 404 the same way `GET /:id` already does), and satisfied all three cases in the fixed `tests/update-user.test.js`.

## Model

I used Claude Sonnet 5. The task was small and well-scoped (a ~30-line diff across two files, following patterns already established by the existing GET/POST handlers), so a lighter model was capable enough without being overkill.

## Commits

I split the work into five logical commits: a pre-existing `eslint` devDependency bump (unrelated to the endpoint, so kept separate), the `updateUser` store helper, the `PUT /users/:id` route handler, `CLAUDE.md`, and this `NOTES.md`. Splitting the store helper from the route handler keeps each commit reviewable on its own — one adds the data-access capability, the other wires it up to HTTP.

## Review

Before committing, I checked the diff against the not-found and invalid-input paths specifically: validation runs before the id is even parsed, so a missing field returns 400 without touching the store; a non-existent or non-numeric id both correctly fall through to 404 via the same `undefined`-return convention `getUserById` already uses. I ran `npm test` (all 9 tests green, including the three update-user cases) and `npm run lint`, which failed for a pre-existing, unrelated reason: the bumped `eslint@^10.8.0` requires a flat `eslint.config.js`, while the repo still has the legacy `.eslintrc.json`. Nothing in the endpoint code itself needed fixing.
