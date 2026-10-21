# PUT /users/:id — notes

## Plan
Add an endpoint that updates an existing user's `name` and `email`.

1. `db/store.js`: add `updateUser(id, { name, email })`. It returns the updated user, or `undefined` when no user has that id. It follows the same shape as `createUser` and is exported alongside it.
2. `routes/users.js`: add `PUT /:id`.
   - Validate first. Both fields must be non-empty strings after trimming. Otherwise return 400 `{ error: "name and email are required" }`.
   - Return 404 `{ error: "User not found" }` when the store returns nothing.
   - Return 200 with the updated user otherwise.
3. Do not change `tests/update-user.test.js`, which is the grading test.

## Model choice
The plan chose Sonnet 5.5 (`claude-sonnet-5-5`). The change is small and the spec is fully defined by the existing tests, so a mid-tier model is enough. No larger model was needed.

The model name reported by the session changed while the work was underway: Sonnet 5.5 during planning, Haiku 5.5 when commits 1 and 2 were made, and Sonnet 5.5 again for commit 3. The `Co-Authored-By` trailer on each commit shows what was reported at that moment. I could not verify which model handled each step, so treat the trailers as the session's own attribution.

## Commit structure
Three commits on `feat/update-user`, each one logical change:

1. `Add updateUser to the data store`
2. `Add PUT /users/:id route with validation`
3. `Add NOTES.md documenting the plan, model choice and review`

Commit 2 depends on commit 1, so the history stays buildable at each step.

## Review findings
A `/code-review` pass at medium level flagged five items.

| # | Finding | Outcome |
|---|---------|---------|
| 1 | `NOTES.md` was missing, so `tests/notes.test.js` failed and `npm test` was red. | **Fixed** by this file. |
| 2 | POST still uses `!name \|\| !email` while PUT trims and type-checks. The same field can be accepted by POST and rejected by PUT, and POST stores untrimmed values. | **Deferred.** Changing POST is outside this task. Follow-up: move `isNonEmptyString` into a shared helper and use it in both routes. |
| 3 | `store.updateUser` does no validation itself. A direct caller that omits a field writes `undefined` into the record. | **Deferred.** The route validates first, so the public API is safe. Follow-up: guard inside the store if other callers appear. |
| 4 | The PUT tests cover only the happy path, a missing user, and a missing field. Whitespace-only, non-string and trimming cases are not tested. | **Deferred.** The grading test file must not be edited, so coverage would need a new test file. Follow-up. |
| 5 | Neither POST nor PUT enforces email uniqueness, so PUT can give two users the same email. | **Deferred.** Matches existing POST behaviour. Needs a decision on whether the spec requires uniqueness. |

## Verification
- `npm run lint` passes.
- `tests/update-user.test.js` passes, 3 of 3.
- `npm test` is run in the final step below.
