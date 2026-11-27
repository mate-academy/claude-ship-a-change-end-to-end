# NOTES — PUT /users/:id

## The plan, and whether it was edited before approval
I wrote the plan in plan mode after reading `routes/users.js`, `db/store.js`, `server.js` and the three test files. It was approved as written, with no edits before approval. It had three parts:

1. **`db/store.js`**: add `updateUser(id, { name, email })`. It looks the user up with `getUserById`, changes that record in place (so later `GET` calls see the update) and returns it. It returns `undefined` when no user has that id, the same "not found" signal `getUserById` already uses.
2. **`routes/users.js`**: add `PUT /:id`, following the existing handlers' pattern:
   - The id is parsed with `Number(req.params.id)`, like `GET /:id`.
   - PUT replaces the whole record, so both `name` and `email` are required. Partial updates would be a `PATCH`, which is out of scope.
   - The body is validated before the lookup. The check doesn't need the store, and a malformed request gets a 400 whatever the id is.
   - A 400 with a specific message is returned when a field is missing, a field isn't a string, a field is empty or only whitespace, or the email has no basic `x@y.z` shape.
   - Values are trimmed before they're saved.
   - An unknown id gets `404 { error: "User not found" }`, the same body as `GET /:id`. A non-numeric id becomes `NaN`, matches no user, and also gets a 404.
3. **`NOTES.md`**: this write-up.

`POST /users` validation was deliberately left as it was, to keep the change focused. It only checks that the fields are truthy, so making it share the PUT validation would be a sensible follow-up.

## Model
Claude Opus 5.5, used through Claude Code. The task is small, but it involves reading existing conventions and matching them (error bodies, id parsing, store style), making a few judgement calls on validation, and writing honest notes. A strong general model handles that in one pass, and for a change this size the extra cost over a smaller model is negligible.

## Commit split
There are three commits on the `update-user` branch, one per layer, in dependency order:

1. `Add updateUser helper to the user store`: data access only. It stands on its own and nothing calls it yet.
2. `Add PUT /users/:id endpoint with validation and 404`: the HTTP behaviour, built on the helper.
3. `Add NOTES.md describing the update-user endpoint`: documentation, kept separate from the code.

Splitting by layer makes each commit easy to review on its own: storage, then HTTP and validation, then prose. Each one could also be reverted on its own. The trade-off is that the full test suite only passes after the third commit. The endpoint tests need commit 2, and the NOTES tests need commit 3.

## Review: what it caught and what it confirmed
- **Confirmed by tests:** `npm test` passes all 9 tests: the 3 update-user tests, the 2 NOTES tests and the 4 existing ones. `npm run lint` is clean.
- **Confirmed by manual checks** (run with supertest beyond the provided tests):
  - `PUT /users/abc` → 404 `User not found`
  - `{ name: "  " }` → 400 `name and email must be non-empty strings`
  - `{ name: 123 }` → 400 with the same message
  - `{ email: "nope" }` → 400 `email must be a valid email address`
  - `{ name: " Ada " }` is saved trimmed as `"Ada"`, and a following `GET /users/1` returns the updated record, so the store really changes it in place.
- **Caught:** the first draft of these notes listed those edge cases as "checked" before they had actually been run. I then ran them, and they all behaved as described, so the claim is now true. No bugs in the code were found.
- **Noted, not changed:** the provided tests only cover a missing field for the 400 case. The stricter checks (type, blank value, email format) are tested only by the manual run above.
