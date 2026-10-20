# NOTES — "update a user" endpoint

## Plan
The plan touched exactly two source files: add an `updateUser(id, { name, email })`
helper to `db/store.js` (same style as `createUser`, returning `undefined` for an
unknown id instead of throwing), and add `PUT /users/:id` to `routes/users.js`.
It covered the three cases in `tests/update-user.test.js` (200 on success, 404 for
an unknown id, 400 for a missing field) plus a few the tests don't check: blank or
non-string names, malformed emails, and a non-numeric id. One thing I added before
approving: the id in the URL must always win, so an `id` sent in the body is ignored.
I also decided the 404 check runs before body validation, so a client is told the
user doesn't exist even if the body is also wrong.

## Model
I used the largest, most capable model available in my Claude session. The change is
small, but it needed careful reading of the tests and of the existing patterns, and a
real self-review afterwards, so I preferred accuracy over speed.

## Commits
1. `Add updateUser helper to the in-memory store` — data access only.
2. `Add PUT /users/:id to update a user` — the route, validation and error responses.
3. `Add NOTES.md` — this write-up.

The store change comes first so each commit runs on its own, and the route commit can
be read as "the HTTP behaviour" without mixing in storage details.

## Review
The self-review checked the not-found path (`/users/9999` and `/users/abc` both give
404), the validation (`{}`, `"   "` as name, a number as name, `"nope"` as email all
give 400 with a clear message) and that a stray `id` in the body is ignored. It caught
one small thing: I was trimming the email even though the email check already rejects
any whitespace, so that `trim()` was removed. It also noted that `POST /users` only
checks that the fields are present, while `PUT` checks types and email format; I left
`POST` unchanged to keep this PR to one change, and it's a good follow-up.
`npm test` (9/9) and `npm run lint` are green.
