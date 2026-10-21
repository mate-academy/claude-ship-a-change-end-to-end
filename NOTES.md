# PUT /users/:id — notes

## Approved Plan
The plan was to add an endpoint that updates an existing user's `name` and `email`:

1. `db/store.js`: add `updateUser(id, { name, email })`, which returns the updated user or `undefined` if the id is unknown. It follows the shape of `createUser` and is exported with it.
2. `routes/users.js`: add `PUT /:id`.
   - Both fields must be non-empty strings after trimming, otherwise 400 `{ error: "name and email are required" }`.
   - An unknown id returns 404 `{ error: "User not found" }`.
   - Success returns 200 with the updated user.
3. Leave `tests/update-user.test.js` untouched.
4. Run `/code-review`, record the findings here, then verify with `npm run lint` and `npm test`.

The plan was approved as written. No changes were made to it before approval.

## Model Choice
I used Claude Sonnet. It suits a small Express API change and gives a good balance of speed and coding capability. The task is a single route plus one store helper, with the expected behaviour fully set by the existing tests, so a larger model was not needed.

Note: the first two commits carry a `Co-Authored-By: Claude Haiku 5.5` trailer, because the session reported that model name when they were made. The third commit carries Sonnet 5.5.

## Commit Structure
The work is split into three commits on `feat/update-user`, one logical change each:

1. `Add updateUser to the data store`: the data-access helper in `db/store.js`.
2. `Add PUT /users/:id route with validation`: the route and input validation in `routes/users.js`. It depends on commit 1.
3. `Add NOTES.md documenting the plan, model choice and review`: documentation only.

Implementation and documentation are kept apart, so the code commits can be read and reverted without the notes.

## Self-Review
A `/code-review` pass and a manual review with probe requests against the running app found the following.

**Correct**
- **Validation:** missing, non-string and whitespace-only `name` or `email` return 400. A missing body also returns 400. Values are stored trimmed, and extra fields such as `id` are ignored.
- **404 handling:** an unknown, non-numeric, negative or fractional id returns 404 `{ error: "User not found" }`.
- **Status codes and style:** 200, 400 and 404 behave as specified. The route uses `store.updateUser` for all data access and matches the existing routes' error format and style.
- **Scope:** the diff touches only `db/store.js`, `routes/users.js` and `NOTES.md`.

**Open issues, not fixed**
- **Medium:** `Number(req.params.id)` accepts `1e0`, `01` and `0x2` as ids 1, 1 and 2. GET `/users/:id` behaves the same way.
- **Medium:** a malformed JSON body returns an HTML error page that includes the stack trace, because `server.js` has no JSON error handler. POST is affected too.
- **Low:** POST validates more loosely than PUT, so the two routes disagree on blank and non-string values.
- **Low:** the store does not guard against a missing field, and nothing checks email format or uniqueness. These match existing POST behaviour.
- **Low:** a request with an unknown id and an invalid body gets 400, not 404, because validation runs first.
- **Test gap:** whitespace, non-string, trimming and id-parsing cases have no tests. The grading test file must not be edited, so they would need a new file.

**Results**
- `npm test`: 9 tests, 9 pass, 0 fail. This includes all three `update-user` tests and the `NOTES.md` tests.
- `npm run lint`: clean when last run, after the route was added.
