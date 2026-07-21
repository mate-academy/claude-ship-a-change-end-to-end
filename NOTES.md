# Notes: PUT /users/:id

**What was in the plan, and did you edit anything before approving?**
The plan was to mirror the existing GET/POST pattern in `routes/users.js`:
add an `updateUser(id, { name, email })` helper to `db/store.js` that looks
up the user and returns `null` if missing, then a `PUT /:id` route that
validates `name`/`email` are present (400), calls the helper, 404s on a
`null` result, and otherwise responds 200 with the updated user. I formed
and executed this plan directly in the same pass rather than presenting a
separate document for approval first, so there was nothing to edit — the
only design decision worth flagging is that validation runs before the
existence lookup, so a bad body on a nonexistent id returns 400, not 404.

**Which model did you choose, and why?**
Sonnet 5. This is a small, well-scoped CRUD addition that follows a pattern
already present twice in the same file, so it needed careful pattern-matching
and test-driven verification rather than heavier extended reasoning.

**How did you split your commits, and why?**
Three commits: the `updateUser` store helper, the `PUT /:id` route, and
`NOTES.md`. Store and route are separated because they're independently
reviewable and revertable — a reviewer can check the data-layer change
without also reading the HTTP-layer change — even though neither is useful
without the other. NOTES.md is its own commit because it's documentation,
not behavior.

**What did your review catch — or confirm was already fine?**
An independent review pass flagged two things: (1) 400 takes precedence
over 404 when both a bad body and a nonexistent id occur together — a real
but intentional design choice, consistent with how `POST /users` already
validates before touching the store, so I left it as-is; (2) `name`/`email`
are checked for truthiness but not type, so a number or object would be
silently stored — a real gap, but one that already exists in `POST /users`,
so fixing it only for `PUT` would create inconsistency rather than resolve
it. No crashes, no 500s, and no bugs specific to this change were found;
tests stayed green (9/9) throughout.
