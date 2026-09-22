# Notes

## Plan
Planned in plan mode: add an `updateUser` helper to `db/store.js` following
the existing `createUser` pattern (returning `null` on a missing id so the
route decides the HTTP response), then add `PUT /users/:id` mirroring the
validation already in `POST /` (400 on missing fields) and the not-found
handling already in `GET /:id` (404). During planning I chose to also reject
a non-numeric id (e.g. `/users/abc`) with an explicit 400 rather than letting
it fall through to a 404 — a malformed id is a different failure than an
absent one, and `Number("abc")` being `NaN` would otherwise silently read as
"not found." That's the one place I edited the plan before approving it; the
existing `GET /:id` was deliberately left as-is to keep the diff scoped.

## Model
Used Claude Sonnet 5. The change follows patterns already present in the
file (POST's validation shape, GET/:id's not-found shape), so a heavier
reasoning model wasn't needed — the work was applying existing conventions
rather than novel design.

## Commits
Two commits: the store helper (`updateUser`) first, then the route that
calls it. Each stands on its own — the data-layer addition is reviewable
without the route, and the route diff is easy to follow since the helper it
depends on already exists by the time it lands.

## Review
Self-reviewed before considering it done: validation runs before the store
call, so a request with a missing field returns 400 even for an id that
also doesn't exist (matches the test `PUT /users/1` with only a `name`,
where user 1 exists but the field is still missing). Confirmed no partial
mutation happens on a rejected request. Confirmed the id-format check is
additive and doesn't change behavior of the existing `GET /:id` route.
Nothing needed fixing — the change stayed consistent with patterns already
in the codebase.
