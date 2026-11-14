# NOTES — PUT /users/:id

## Plan
The approved plan touched two files: add an `updateUser(id, { name, email })` helper to `db/store.js`, then add a `PUT /users/:id` route in `routes/users.js` that validates input, calls the helper, and returns 200 / 400 / 404. Before approving I tightened it in two places: validation must reject non-string and whitespace-only values (not just missing ones), and a non-numeric id like `/users/abc` should return 404 rather than slip through.

## Model
I used Claude Opus. The feature is small, but the point of the project was careful planning and a real review of edge cases, so I preferred the stronger reasoning model over speed. Sonnet would also have been a reasonable choice for a change this size.

## Commits
1. `db/store.js` — add `updateUser` (data layer on its own, follows the existing store pattern).
2. `routes/users.js` — add the PUT route with validation and the not-found path (this is the commit that turns the update-user tests green).
3. `NOTES.md` — this write-up.

One logical change per commit, ordered so each builds on the last and the history reads as data layer → endpoint → docs.

## Review
The review confirmed: unknown ids return 404 without crashing; missing, empty, whitespace-only, and non-string fields return 400; a non-JSON body returns 400; lint passes. Things it flagged that I decided were acceptable for now: the in-memory store mutates the user object in place (fine here since there's no real DB), and validation runs before the existence check, so an invalid body on an unknown id returns 400 rather than 404. PUT is treated as a full replace (both fields required); partial updates would be a PATCH.

After opening the PR, the course reviewer pointed out that the `@`-only email check let values like `@` and `name@` through. I replaced it with a minimal format check (`local@domain.tld`, no spaces, a single `@`), so those now return 400.
