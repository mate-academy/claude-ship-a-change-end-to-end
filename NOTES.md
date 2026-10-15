# Notes

## What was in the plan you approved, and did you edit anything before approving?

Here is the plan that was written:
````
# Add PUT /users/:id (update a user)

## Context

The users resource currently supports list, fetch-by-id, and create, but not update. `tests/update-user.test.js` already defines the contract for a `PUT /users/:id` endpoint (currently failing/red). The goal is to implement the endpoint and its store-layer support so those tests pass, following the exact conventions already used by the other user routes.

## Contract (from `tests/update-user.test.js`, not to be edited)

1. `PUT /users/:id` with valid `{ name, email }` for an existing user → `200`, response body reflects the updated `name`/`email`.
2. `PUT /users/:id` for a non-existent id (e.g. `9999`) → `404`.
3. `PUT /users/:id` with a missing field (e.g. no `email`) → `400`.

## Changes

### `db/store.js`
Add an `updateUser(id, { name, email })` function alongside `getAllUsers`, `getUserById`, `createUser`:
- Find the user in `users` by `id` (same lookup style as `getUserById`).
- If not found, return `undefined` (mirrors `getUserById`'s `.find()` behavior — route layer decides the 404).
- If found, mutate the matched object's `name` and `email` in place (or replace it in the array) and return the updated user.
- Add `updateUser` to `module.exports`.

### `routes/users.js`
Add a new handler:

```js
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const id = Number(req.params.id);
  const user = store.updateUser(id, { name, email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
```

- Validate first (matches POST's validation style and message `{ error: "name and email are required" }`), then look up/update and check for not-found (matches GET-by-id's `{ error: "User not found" }`, `404`).
- Success returns `res.json(user)` (200 default), matching GET's style.

No changes needed to `server.js` (routing is already mounted at `/users`) or to any test file.

## Verification

- Run `npm test` and confirm all tests in `tests/update-user.test.js` pass (3 tests), and that no existing tests (`tests/users.test.js`, `tests/notes.test.js`) regress.
- Run `npm run lint` to confirm the new code passes ESLint (CommonJS style, matches existing formatting).

## Outcome

Implemented as planned. All 3 tests in `tests/update-user.test.js` pass, no regressions in existing tests, and `npm run lint` is clean.
````

The plan was solid and did not require any editing.

## Which model did you choose, and why?

I chose the Sonnet model for the `store.js` changes since the plan gave instructions on what to include but the "how" would be up to the model.

Since the changes for `users.js` had already been drafted within the plan, I used Haiku to implement it.

## How did you split your commits, and why that way?

I split the commits by file, mainly because they were written in their entirety be individual models.

## What did your review catch — or confirm was already fine?

Found in the code-review:

1. db/store.js:39 (correctness, plausible) — updateUser mutates the stored object in place instead of replacing it. Previously nothing wrote to a stored user after creation, so returning live references from getUserById/getAllUsers was harmless; now a held reference can change out from under a caller after an unrelated PUT. No current code holds such a reference, so it's not an active bug today, just a latent hazard.
2. routes/users.js:39 (simplification, confirmed) — the !name || !email check is copy-pasted from POST rather than shared, so the two endpoints can drift out of sync if validation rules change later.
3. db/store.js:28 (simplification, confirmed) — updateUser re-implements the id lookup instead of calling getUserById, so a future fix to lookup semantics could apply to one path and not the other.

The not-found path (404 for a nonexistent id) and the required-field 400 path both check out correctly against the tests.