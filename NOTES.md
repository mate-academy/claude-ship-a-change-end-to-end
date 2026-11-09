# NOTES — `PUT /users/:id`

## The plan I approved
Add `updateUser(id, { name, email })` to `db/store.js` (returns `undefined` for an
unknown id), then a `PUT /users/:id` route in `routes/users.js` that mirrors the
existing GET/POST handlers: validate first (name and email must be non-empty
strings → 400), then update through the store (no user → 404), otherwise 200 with
the updated user. The plan also covered setup work: `node_modules` was missing, so
`npm test` failed on `supertest` before any real test ran, and we were on `main`,
so it creates a feature branch first. I approved it without edits. It already
handled both the not-found and invalid-input cases.

## Model
Claude Opus 5.5. The feature is small, but the job was plan → build → self-review
in one session, and I wanted the strongest reasoning for the review step.
A smaller model like Sonnet would very likely have done the code just as well.

## Commit split
1. **Store helper.** The data-access change on its own, matching the pattern that
   all routes go through `db/store.js`.
2. **Route.** The HTTP behaviour (validation, 404, 200). This is the commit that
   turns `tests/update-user.test.js` green.
3. **NOTES.md.** Documentation only.

Each commit makes sense by itself and could be reverted without breaking the
others.

## What the review caught / confirmed
I exercised the endpoint against the real app, not just the provided tests.
Confirmed fine: unknown and non-numeric ids → 404, missing/blank/non-string
fields and no body → 400, and an `id` in the body is ignored (the id can't be
overwritten). Things I chose to leave as they are, to stay consistent with
existing code: `/users/1.0` resolves to user 1 (GET does the same), values aren't
trimmed and email format isn't checked (POST doesn't do either), and malformed
JSON gets Express's default 400 error page app-wide. Those would be follow-ups
across all routes, not part of this change.
