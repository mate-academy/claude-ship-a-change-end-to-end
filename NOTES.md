# Notes — Ship a change end to end

## The plan I approved

Add `PUT /users/:id` to the users resource, in two layers that match the code
already there:

1. `db/store.js` gets an `updateUser(id, { name, email })` helper that reuses
   `getUserById`, returns `undefined` when the id is unknown, and otherwise
   mutates the stored user in place (the store is in-memory, so createUser
   mutates too — this stays consistent).
2. `routes/users.js` gets the route: coerce `:id` to a number, require both
   `name` and `email` (same check and error message as `POST /users`), return
   `400` if either is missing, `404` if the store reports no such user, and the
   updated user as JSON with `200` otherwise.

I didn't change the plan before approving. The only small decision made while
building: check validation before existence, so a bad payload gets `400`
regardless of whether the id exists.

## Model

Claude Sonnet 5. The change is small and the pattern to follow was already in
the file, so a heavier model wasn't needed — Sonnet handles "mirror the
existing POST handler for PUT" quickly and cheaply.

## Commit split

Three commits, each understandable on its own:

1. `db/store.js` — the `updateUser` helper (data layer, no HTTP).
2. `routes/users.js` — the `PUT /users/:id` route wired to the helper.
3. `NOTES.md` — this write-up.

Data helper before the route that consumes it, so each commit builds on a
working tree and history reads in dependency order.

## What the review caught

Nothing that needed a code change. It confirmed:

- the not-found path can't crash — `updateUser` returns `undefined` and the
  route turns that into `404`;
- a non-numeric id (`Number("abc")` → `NaN`) falls through to `404`, not a 500;
- validation and error message match `POST /users`, so the resource stays
  consistent;
- this is a full replace (both fields required), not a partial patch — which is
  what the provided tests expect.

`npm test` is green and `npm run lint` is clean.
