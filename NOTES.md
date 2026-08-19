# Notes

## Plan
Planned to add a `PUT /users/:id` route in `routes/users.js` plus a matching
`updateUser(id, { name, email })` helper in `db/store.js`, mirroring the
existing patterns exactly: the missing-field validation from `POST /` (400
when `name` or `email` is falsy) and the not-found handling from
`GET /users/:id` (404 when the lookup misses). Validation runs before the
existence check, since the tests exercise a missing field against an id that
does exist. The plan was approved as written — no edits were needed before
starting.

## Model choice
Used Claude Sonnet 5 for the whole change. The task was small, well-scoped by
the pre-written tests, and followed conventions already present in the repo,
so a lighter-weight model was enough — no need to reach for a larger one.

## Commit split
One logical commit: the route and the store helper together, since they're a
single indivisible change (the route is unusable without the helper, and the
helper has no other caller). `NOTES.md` is a separate commit on top, since
it's a distinct deliverable from the code change itself.

## What review caught
Self-reviewed the diff against the existing route/store code before pushing.
No changes were needed — confirmed:
- non-numeric `:id` (e.g. `NaN` from `Number("abc")`) safely falls through to
  the 404 path, same as the existing `GET /:id` route.
- validation order (400 before 404) matches what the tests expect and is
  consistent with `POST /`'s style.
- whitespace-only strings (e.g. `" "`) pass validation, same lenient
  behavior `POST /` already has — not a new issue introduced by this change.
