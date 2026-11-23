# Notes: PUT /users/:id

## The plan I approved
Before writing code I ran the baseline: `npm install`, `npm test` (5 pass, 4 fail) and
`npm run lint` (clean). The plan, made in plan mode, touched three files: `db/store.js`
(a new `updateUser` helper), `routes/users.js` (a `PUT /:id` route with validation) and this
file. It fixed these behaviours: PUT replaces both fields, so both are required; bad input
returns 400 with a clear message; an unknown id returns 404 "User not found", the same as
`GET /users/:id`; all data access goes through the store. I approved the plan as written and
did not edit it. One thing I noted in it: the provided 404 test passed before any change, only
because Express answers 404 for an unknown route, so the plan said it must pass for the right reason.

## Model
I used Claude Sonnet 5.5 through Claude Code. The change is small and well specified (one route,
one store helper, clear tests), so a fast, capable model was enough and a heavier one would have
added cost without helping.

## Commit split
1. `db/store.js`: the `updateUser` helper. It is the lowest layer and has no dependency on the
   route, so it stands alone and is easy to review.
2. `routes/users.js`: the endpoint with validation and the 404 path. The update-user tests turn
   green here, so this commit is the feature.
3. `NOTES.md`: the write-up, last, so it describes what really happened.
One logical change per commit, so each message makes sense without opening the diff.

## What the review caught
The review found no bug in the new code, and confirmed these points:
- Validation: empty, whitespace-only, non-string and null values and a malformed email all
  return 400; the body is trimmed; extra fields such as `id` or `role` are ignored, so an id
  can't be rewritten.
- Not found: an unknown id (`9999`), `0` and a non-numeric id (`abc`) return 404, not a crash.
- Order: the body is validated first, so a bad body for an unknown id gives 400.
It did surface one quirk, which I left alone: `Number()` turns ids such as `1.0`, `0x1`, `1e0`
or ` 1` into 1, so they update user 1. `GET /users/:id` already does the same, and the change
stays consistent with it, so I did not widen the scope. Malformed JSON gets Express's default
400, as it already does for `POST /users`.
