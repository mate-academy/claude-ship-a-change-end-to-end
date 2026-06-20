# Notes — Ship a change end to end

## The plan
Add an `update a user` feature as `PUT /users/:id`, in two layers:
1. A `updateUser(id, { name, email })` helper in `db/store.js` that returns `null` when the user doesn't exist and otherwise overwrites the fields — mirroring the existing `getUserById` / `createUser` helpers so all data access stays in the store.
2. A `PUT /users/:id` route in `routes/users.js` that validates the input, then updates via the store, returning 400 (missing field), 404 (unknown id), or 200 (updated user).

I didn't need to change the plan much, but I made one deliberate decision: validate the input **before** the not-found lookup. That ordering means a missing field on a real id returns 400, and a valid body on an unknown id returns 404 — both of which the tests require.

## Model choice
Claude Opus 4.8 (1M context). The change is small, but it spans a route, a store helper, and three behavioural cases (update / not-found / invalid), so I wanted the strongest reasoning to get the validation/lookup ordering and the edge cases right the first time rather than iterating.

## Commit split
Three logical commits, each understandable without the diff:
1. `Add updateUser helper to the in-memory store` — the data layer on its own.
2. `Add PUT /users/:id endpoint to update a user` — the route that uses it.
3. `Add NOTES.md` — this write-up.
Splitting the store helper from the route keeps each commit to one concern, so the data-access change can be reviewed independently of the HTTP wiring.

## What the review caught / confirmed
The review confirmed the not-found path is safe — a non-numeric id (`Number("abc")` → `NaN`) simply never matches and returns 404 instead of crashing. It also surfaced one judgment call: the README mentions rejecting "invalid" fields, but I validate presence only (`name && email`), matching the existing `POST /users` behaviour rather than inventing a stricter format check the tests don't specify. That parity is intentional; a real API might add type/format validation, but doing so here would diverge from the established pattern.
