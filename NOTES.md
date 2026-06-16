# NOTES

## The plan I approved

Ship `PUT /users/:id` in two layers, mirroring the patterns already in the
repo:

1. A `updateUser(id, { name, email })` helper in `db/store.js`, so the route
   does data access through the store like every other route.
2. The `PUT /users/:id` route in `routes/users.js`: validate that `name` and
   `email` are present (400 on a missing/empty field), return 404 when the id
   matches no user, otherwise update and return the user with 200.

I didn't change the plan — it already covered the three cases the provided
tests check (update, 404, 400). The only refinement I made while building was
deciding the order of the two guards (see the review section).

## Model choice

Opus 4.8. The feature is small but real (validation, two error paths, an
existing pattern to follow), and the cost of a subtle bug in error handling is
higher than the token savings of a smaller model. For a single-file change with
provided tests, Opus finished it in a couple of turns.

## Commit split

Three logical commits, each understandable without opening the diff:

1. `feat: add updateUser helper to in-memory store` — the data layer.
2. `feat: add PUT /users/:id endpoint` — the route that uses it.
3. `docs: add NOTES.md` — this write-up.

Store first, then the route that depends on it, then docs. That order means
each commit builds on a working state and the history reads as a small,
reviewable progression rather than one big drop.

## What the review caught / confirmed

- **Validation order:** I validate input *before* checking existence, so a
  missing field returns 400 even for an unknown id. Consistent with validating
  cheaply first; the tests pass either way.
- **Non-numeric id:** `Number("abc")` is `NaN`, which matches no user, so the
  store returns `undefined` and the route answers 404 rather than crashing.
- **Empty strings:** `!name || !email` rejects `""` as well as missing fields,
  matching the existing `POST /users` behaviour.
- **PUT semantics:** both fields are required (full replace), which is what the
  test expects and matches how `POST` treats the same fields.

Review confirmed the happy path and both error paths; no bugs to fix.
