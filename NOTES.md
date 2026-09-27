# Notes

## The plan, and what I changed before approving it

The plan was two files. In `db/store.js`, an `updateUser(id, { name, email })` helper that looks the user up, overwrites both fields, and returns the user — or returns `undefined` when no user has that id. In `routes/users.js`, a `PUT /:id` route that parses the id with `Number()` like `GET /:id` does, rejects a missing `name` or `email` with 400, turns the store's `undefined` into 404, and otherwise responds 200 with the updated user.

One thing I pinned down before approving: **validation runs before the lookup**. The test `PUT /users/1 with a missing field returns 400` uses an id that may or may not exist, so if the order were reversed a missing user would shadow the missing field and produce 404 where 400 is expected. I also cut two things from the first draft — email-format checking and partial updates (`PATCH` semantics). Neither is in the tests, and `POST /users` doesn't do them either; adding them here would have made the two endpoints disagree about what a valid user is.

## Model choice

Opus 5. The feature is small, but "small" wasn't the deciding factor: the work is mostly about matching conventions that already exist in the repo (error shapes, `Number()` on the id, data access only through the store) and about getting the validation/lookup order right — judgement calls rather than volume of code. A cheaper model would very likely have produced a working endpoint too; I'd have used one for a mechanical change like renaming a field across files.

## Commit split

Three commits, one logical change each:

1. **`Add updateUser helper to the store`** — the data layer alone. It compiles and the existing suite still passes, but nothing calls it yet.
2. **`Add PUT /users/:id to update a user`** — the route that uses it. This is the commit that turns `tests/update-user.test.js` green, so a bisect would land exactly here if the endpoint ever regressed.
3. **`Add NOTES.md`** — the write-up, kept out of the code history.

The split follows the direction of the dependency: the store doesn't know about the route, so it can land first and be read on its own. Squashing them would have hidden which change made the tests pass.

## What the review caught

The review didn't find a bug, but it did confirm two things I wanted to be sure of, by exercising cases the tests don't cover:

- **A non-numeric id (`/users/abc`) returns 404, not a crash.** `Number("abc")` is `NaN`, no user matches, and the route answers 404.
- **An `id` in the request body can't renumber a user.** `updateUser` only assigns `name` and `email`, so `PUT /users/2` with `{"id": 999, ...}` leaves the id at 2.

It also flagged three inputs that are accepted but arguably shouldn't be: a whitespace-only name (`"   "`), a non-string name (`123`), and an email that isn't an email (`"not-an-email"`). I left all three alone deliberately. `POST /users` accepts exactly the same inputs, so tightening only `PUT` would mean two endpoints disagreeing about what a valid user is — a worse state than being uniformly permissive. That belongs in its own change, applied to both endpoints, ideally with shared validation.
