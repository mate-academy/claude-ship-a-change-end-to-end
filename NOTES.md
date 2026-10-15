# NOTES

## The plan

Add `PUT /users/:id` following the same shape as the existing `GET /:id` and `POST /` handlers: validate `name`/`email` are present (400 if not, reusing the `!name || !email` check `POST` already uses), then update through a new `db/store.js` helper, returning 404 when the id doesn't exist rather than letting a lookup miss crash the request. No changes needed outside `routes/users.js` and `db/store.js`. I didn't edit the plan before approving it — it matched the README's description of the endpoint and the existing route conventions closely enough that there was nothing to push back on.

One deliberate choice not spelled out in the plan: validation runs *before* the existence check, so `PUT /users/9999` with a missing field returns 400, not 404. That matches how `POST` is already written and isn't tested either way by the grading tests, but it's worth a reviewer's eyes.

## Model choice

Sonnet — this is a small, well-specified CRUD addition to an existing pattern (mirror what `GET`/`POST` already do), not a task that needs Opus-level architectural judgment, and it's more than a one-line mechanical edit where Haiku would do.

## Commit split

Two commits for the feature, plus this one for the write-up:
1. `Add updateUser to the data store` — the data-access change alone.
2. `Add PUT /users/:id endpoint` — the route that uses it, which is what actually turns the update-user tests green.

Split this way so each commit is independently reviewable: the first is "how we touch storage," the second is "how the route behaves," and neither depends on guessing what the other one does. A message-quality lesson earlier in the course did the same helper-then-caller split.

## What the review caught

Self-review before pushing, asking specifically about bugs, edge cases, the not-found path, and validation:

- Non-numeric `:id` (e.g. `PUT /users/abc`) — `Number("abc")` is `NaN`, and `NaN === NaN` is always `false`, so the store lookup correctly falls through to 404 instead of throwing. No fix needed, but worth confirming since it's exactly the kind of thing that's easy to get wrong.
- Empty-string `name`/`email` (e.g. `""`) — caught by the same falsy check `POST` uses, so it's rejected with 400 rather than silently saved as blank.
- `req.body` on a request with no JSON body — `express.json()` defaults it to `{}`, so destructuring doesn't throw; it just fails validation as expected.
- `updateUser` mutates the found user in place rather than building a new object. That matches how the rest of `db/store.js` already treats `users` (no copy-on-write anywhere else), so it's consistent rather than a new risk.

Nothing here needed a fix — the review mostly confirmed the edge cases the tests exercise (and one, the invalid-id case, that they don't) already behave correctly.
