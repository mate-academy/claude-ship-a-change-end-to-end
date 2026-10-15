# Notes — 'update a user' endpoint

## The plan I approved

Two files, in this order:

1. `db/store.js` — add `updateUser(id, { name, email })` that reuses the existing
   `getUserById`, returns `undefined` when there's no such user, and otherwise
   updates the record and returns it. Returning `undefined` rather than throwing
   keeps it consistent with `getUserById` and lets the route decide the status code.
2. `routes/users.js` — add `PUT /users/:id`: validate the body first (400), then
   look the user up through the store (404), then 200 with the updated user.

I changed one thing before building: the first cut of the plan validated with the
same `!name || !email` check the existing `POST /users` uses. That accepts
`{ "name": 42 }` and `{ "name": "   " }`, which isn't really "validate the input",
so I replaced it with a small `isNonEmptyString` helper that requires a non-blank
string. I also decided to keep the check order as validate-then-lookup, so a
malformed body is reported as a bad request even if the id also doesn't exist.

## Model

Claude Opus 5 (1M context). The change is small, but it's the kind of small where
the details are the whole task — status-code choices, the not-found path, what
counts as invalid input. Opus was worth it for getting those judgement calls right
in one pass rather than iterating; a lighter model would have been a fine choice
for something more mechanical.

## Commit split

Three commits, each one reviewable on its own:

1. **store helper** — the data layer alone, with no route depending on it yet.
2. **the endpoint** — the route, validation and the two error paths, which is the
   commit a reviewer actually wants to read.
3. **NOTES.md** — documentation, kept out of the code commits so the code diff
   stays clean.

Splitting on the layer boundary means the first commit is a self-contained
"here's what the store can now do" and the second is "here's how the API uses it".

## What the review caught

- **Confirmed fine:** a non-numeric id (`PUT /users/abc`) becomes `NaN`, misses the
  lookup and returns 404 rather than crashing — I checked this by hand, not just by
  reasoning about it.
- **Confirmed fine:** extra fields in the body are ignored. Only `name` and `email`
  are copied onto the record, so `{ "id": 99, "admin": true }` can't rewrite the id
  or add fields. Verified with a manual request.
- **Caught:** the loose truthy validation described above, fixed before committing.
- **Deliberately left alone:** `POST /users` still uses the looser check, so it
  accepts a non-string name. Tightening it would change the behaviour of an
  endpoint this task isn't about, so it's a follow-up, not part of this change.
- **Noted:** `updateUser` mutates the stored object in place. That's safe here
  because the store is the single owner of the array and the existing helpers
  already hand out live references — worth revisiting if this ever becomes a real
  database layer.
- **Scope:** `PUT` is a full replace, so both fields are required. Partial updates
  would be a `PATCH`, which the tests don't ask for.
