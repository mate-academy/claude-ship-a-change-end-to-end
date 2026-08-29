# Notes on the "update a user" change

## The plan I approved

Add `PUT /users/:id` to `routes/users.js` plus a matching `updateUser` helper in
`db/store.js`, so routes never touch the `users` array directly. The route validates
that `name` and `email` are both present (400 if not), converts the `:id` param to a
number before looking the user up, returns 404 when no user has that id, and responds
with the updated user on success. `server.js` needed no changes because the users
router is already mounted there.

I made one edit to the plan before approving it: I moved validation ahead of the
lookup. The 400 test hits `/users/1`, which is a real seeded user, so validating first
makes the 400 come from the validation check itself rather than from a lookup that
happened to miss.

## Model choice

Sonnet for the whole task. It is a small, well-scoped change in a tiny codebase with
tests that spell out the exact contract, so the extra reasoning budget of a larger
model would not have bought anything. I used plan mode first so the approach was
reviewed before any code was written.

## Commit split

Three commits: (1) the `updateUser` store helper, (2) the `PUT` route that calls it,
(3) this `NOTES.md`. Helper before route mirrors the dependency direction and keeps
each diff to one file and one idea. Docs are separated from code so the graded change
stays easy to read on its own.

## What the review caught

Running the endpoint against a live server confirmed the three test cases plus two
edge cases the tests do not cover: a non-numeric id (`/users/abc`) returns 404 rather
than crashing, because `Number("abc")` is `NaN` and never matches an id; and a request
with no body at all returns 400, because `express.json()` yields `{}` and the
validation check catches it. A follow-up `GET` confirmed the update actually persisted
in the store.

Known limitation left in on purpose: validation is a truthiness check identical to
`POST /users`, so it does not reject a whitespace-only name or a non-string value.
Making `PUT` stricter than `POST` on the same resource would be inconsistent; if that
validation is wanted it should be added to both routes together.
