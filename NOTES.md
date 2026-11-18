# NOTES

## The plan
I had Claude read the tests and the existing code first and plan it before writing anything. The plan was: add an `updateUser` helper in `db/store.js` (so the route doesn't touch the users array directly, same as the other routes), then add `PUT /users/:id` in `routes/users.js` with validation and a 404. The one thing I pushed on before going ahead: the tests only check a *missing* field, but the brief says missing or invalid, so I wanted it to also reject an email without an @ and a name that's just spaces. I also made it pick an order: it validates the body first, then checks if the user exists. So a bad body on an unknown id gets a 400, not a 404.

Something I noticed at the start: the "PUT returns 404 for a user that doesn't exist" test was already green before I wrote any code. It was passing only because the route didn't exist at all and Express returns 404 for anything unknown. So green doesn't always mean done.

## Model
This ran on Opus. Honestly for a change this size Sonnet would have been enough, the spec was clear and the tests were already written, so there wasn't much hard thinking needed. If I did it again I'd use Sonnet and save Opus for something with more unknowns.

## Commits
Three commits, one job each:
1. the `updateUser` store helper
2. the `PUT /users/:id` route with validation and the 404
3. this NOTES.md

Store first because the route depends on it, and keeping them apart means each commit makes sense on its own when you read the history. NOTES is separate because it's not code.

## Review
Before pushing I had Claude go over the diff and I tried the edge cases myself: email without a dot or @ → 400, name of only spaces → 400, name sent as a number → 400, id "abc" → 404, plain text body instead of JSON → 400, unknown id → 404. All behaved. `npm test` is 9/9 and `npm run lint` is clean (CI runs lint too, not just tests).

What it flagged that I left alone on purpose: `POST /users` still accepts an invalid email or a blank-after-trimming name, so create and update aren't equally strict now. That's a real inconsistency but it's outside this change, I'd do it as its own PR rather than sneak it in here. Also the error for a non-text name says "name and email are required", which is a bit misleading, minor.
