# Notes

## The plan
The approved plan was to add `PUT /users/:id`: add a `store.updateUser(id, { name, email })`
helper mirroring `getUserById`/`createUser`, then a `PUT /:id` route handler
in `routes/users.js` mirroring the existing `GET /:id` not-found handling and
`POST /` validation — 400 for a missing `name`/`email`, 404 for an unknown
id, 200 with the updated user otherwise. I approved it as written, without
editing it — the tests in `tests/update-user.test.js` fully specified the
contract, and the existing GET/POST handlers gave an unambiguous pattern to
follow, so there was nothing to negotiate.

## Model choice
Claude Sonnet 5. The task is small and pattern-following (copy the shape of
two existing handlers), not one needing deep architectural judgment, so a
lighter/faster model than Opus was the right fit — Sonnet is capable enough
to get validation ordering and status codes right on the first pass while
staying cheap for a change this size.

## Commit split
Two commits:
1. `Add PUT /users/:id to update a user` — the `db/store.js` helper and the
   `routes/users.js` route together, since the route handler has no useful
   existence without the store helper; splitting them further would just
   create a broken intermediate commit.
2. `Add NOTES.md write-up` — kept separate because it's a different kind of
   change (process documentation, not application code) and isn't needed for
   the feature itself to work.

## What the review caught
Walked through the not-found path and validation by hand: a non-numeric id
(`Number("abc")` → `NaN`) correctly falls through to 404 since `NaN === NaN`
is false in `getUserById`'s lookup, rather than throwing or matching
anything. Confirmed validation runs *before* the id lookup, so a request
with both a missing field and an unknown id returns 400, not 404 — consistent
with how `POST` is written. Also confirmed `express.json()` is mounted
globally in `server.js`, so `req.body` is populated before the handler runs.
No bugs found; nothing needed changing as a result of the review — the gaps
that exist (no type/format validation on `name`/`email`, e.g. falsy-but-odd
values like `0` being rejected while non-string values are accepted) are
pre-existing looseness inherited from `POST /users`, not regressions
introduced by this change.
