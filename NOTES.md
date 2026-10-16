# Notes: PUT /users/:id

## The plan
I planned in plan mode before writing any code, and approved it without editing it. It had three parts:
- Add `updateUser(id, { name, email })` to `db/store.js`. It returns `undefined` for an unknown id, like `getUserById`, and never changes the id.
- Add `PUT /users/:id` to `routes/users.js`. It returns 400 unless `name` and `email` are both non-empty strings, and 404 if the user doesn't exist. The error messages match the existing POST and GET routes.
- Write this file last, once the commit split and review results were real.

I validate before the lookup, so a bad body is a 400 even for an unknown id.

## Model
Claude Sonnet 5.5. The change is small and well specified: one route, one store helper, and tests that define "done". That doesn't need a larger model.

## Commits
Three commits, one logical change each:
1. `db/store.js`: add the `updateUser` helper.
2. `routes/users.js`: add the PUT route with validation and 404.
3. `NOTES.md`: this write-up.

The store goes first because the route depends on it, and each commit is understandable without the diff.

## Review
A code review flagged 8 items. I checked each against the code.
- **Confirmed:** `NOTES.md` was missing, which is this file.
- **Confirmed but left alone:** PUT validation is stricter than POST. POST accepts whitespace-only and non-string values. Changing POST was out of scope, so it's a follow-up. Two small nits are also unfixed: validated values are stored untrimmed, and the `isValid` helper is defined inside the handler.
- **Not a problem:** the other items either match existing behavior (`GET` also returns 404 for non-numeric ids, `createUser` also returns live records) or can't happen here (`express.json()` always sets `req.body`).

I made no code changes after the review. Manual checks confirmed 200, 400 (empty, whitespace, non-string) and 404 (unknown and non-numeric id).
