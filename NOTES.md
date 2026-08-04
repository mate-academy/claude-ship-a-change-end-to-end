# NOTES

## Plan

The plan was to add `PUT /users/:id` by mirroring the existing route/store
pattern: a new `updateUser(id, { name, email })` helper in `db/store.js`
(find-or-return-`undefined`, same style as `getUserById`/`createUser`), and a
new `router.put("/:id", ...)` handler in `routes/users.js` that validates the
body, looks up the user via the store, and returns 400/404/200 as
appropriate — no new files, no validation library.

One thing was edited before approving: the initial draft validated `name`
and `email` with the same bare `!name || !email` truthiness check `POST /`
uses. The task explicitly asked to reject "missing **or invalid**" fields,
and a plain truthiness check would silently accept non-string or
whitespace-only values (e.g. `{ name: 123, email: "   " }`). I tightened it
to require both fields to be non-empty strings after trimming, while leaving
`POST /`'s validation untouched to keep the diff scoped to the new endpoint.

## Model

Claude Sonnet 5, via Claude Code. This is a small, well-scoped change against
an existing, consistent pattern (two similar routes and two similar store
functions already exist to mirror), so a smaller/faster model was enough —
no need to reach for a heavier one.

## Commits

The change splits into two logical pieces, matching the two files touched:

1. `db/store.js` — add the `updateUser` data-access helper.
2. `routes/users.js` — add the `PUT /:id` route handler that uses it.

Keeping the store helper and the route in separate commits mirrors how the
existing `createUser`/`POST /` pair would read in history, and makes it easy
to review the data-layer change independently of the HTTP-layer change.

## Review

The main thing the review-style pass caught was the validation-strictness
question above — the literal "missing or invalid fields" wording in the task
doesn't match what `!name || !email` alone actually rejects. Re-reading the
task text against the draft implementation surfaced the gap before writing
any code, rather than after.

Everything else checked out against the existing conventions: id parsing via
`Number(req.params.id)` (so a non-numeric id naturally falls through to 404,
same as `GET /:id`), the `{ error: "..." }` response shape reused verbatim
from the existing 400/404 responses, and updating in place through the store
rather than mutating the `users` array directly from the route. `npm test`
and `npm run lint` were run after implementing and both are clean.
