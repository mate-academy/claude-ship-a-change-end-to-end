# NOTES — `PUT /users/:id`

## The plan

The plan was to read `tests/update-user.test.js` first (200 on update, 404 for an
unknown id, 400 for a missing field) and touch only two files:

1. `db/store.js` — add `updateUser(id, { name, email })` that returns the updated
   user or `undefined`, so the route never touches the `users` array directly.
2. `routes/users.js` — add `PUT /:id` that validates the body, calls the store,
   and maps `undefined` to a 404, mirroring the existing `GET /:id` and `POST /`.

One thing added to the plan before building: validation should be a bit stricter
than `POST /` — not just "present", but non-blank strings and an email that looks
like an address — because the task asks to reject *invalid* fields, not only
missing ones. Validation runs before the store lookup, so a bad body never
reaches data access.

## Model

Claude Opus 5.5. The change is small, but the point of the exercise was getting
the edge cases and the commit/PR workflow right in one pass, and the strongest
model is the safest bet for that. For a change this size a faster model would
also have been fine.

## Commits

1. **Add updateUser helper to the in-memory store** — the data-access layer on its own.
2. **Add PUT /users/:id endpoint to update a user** — the route, validation and 404;
   this is the commit that turns the update-user tests green.
3. **Add NOTES.md** — the write-up.

Split by layer so each commit is one logical change that can be reviewed (or
reverted) on its own, and the store commit doesn't break anything by itself.

## What the review checked

Probed the endpoint by hand beyond the provided tests:

- non-numeric id (`/users/abc`) → 404, not a crash (`Number("abc")` is `NaN`, no match)
- blank name (`"  "`), non-string name (`123`), malformed email (`"nope"`) → 400
- an `id` sent in the body is ignored — the user's id can't be overwritten
- surrounding whitespace in name/email is trimmed before saving

Confirmed fine: the store returns the same object it mutates, so `GET` sees the
update. Noted but left out of scope: malformed JSON bodies get Express's default
400 error (with a stack trace in the server log); that's app-wide behaviour and
better fixed with a shared error handler in a separate change.
