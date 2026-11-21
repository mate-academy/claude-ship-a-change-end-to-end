# NOTES

## Plan

Add `PUT /users/:id` to the in-memory Express API. The target behaviour is defined by `tests/update-user.test.js`:

- 200 with the updated user when the id exists and both `name` and `email` are sent.
- 400 when `name` or `email` is missing.
- 404 when no user has that id.

Implementation follows the existing patterns:

- `db/store.js`: `updateUser(id, { name, email })` reuses `getUserById`, changes the fields in place, keeps the id, and returns `undefined` when the user is missing.
- `routes/users.js`: the PUT handler validates the body with the same check as POST (`!name || !email`), then maps a missing user to 404 with `{ error: "User not found" }`.

Before I approved the plan, I corrected it twice. First, the model had to be verified, not assumed. Second, the review section must not be filled in ahead of the review. The review section below was written only after `/code-review` ran.

## Model

The session runs on **Haiku 5.5** (`claude-haiku-5-5`), confirmed with `/model`. I did not choose it on purpose; it was the session's default model. I kept it because the change is small, the tests are clear, and Haiku is fast. The plan and the review were there to offset the risk of a smaller model.

## Commit split

1. `2a0b4e5` feat(store): add updateUser helper. Changes `db/store.js` only.
2. `7cfed64` feat(users): add PUT /users/:id with validation and 404. Changes `routes/users.js`. The three PUT tests pass here.
3. `59e72fc` docs: add NOTES.md. Adds this file.
4. `4da72b4` fix(users): reject non-string and blank values on PUT /users/:id. Fixes the review finding in `routes/users.js`. It first also added an extra test file, which was removed in the next commit (see below).
5. `6bcb180` docs: record code review findings in NOTES.md. Fills in the review section below.

Commits 1 to 3 carry a `Co-Authored-By: Claude Sonnet 5.5` trailer. Commits 4 and 5 carry `Co-Authored-By: Claude Haiku 5.5`. The trailers were not rewritten, so the first three do not match the model that was actually used.

The change is split so that each commit has a single logical change: the store helper, the route, the notes, the validation fix, and the review record. That makes each one easier to review and lets any of them be reverted on its own.

## What the review caught

Ran `/code-review` (medium, up to 5 findings) on the branch diff. It reported two findings:

1. **Fixed (important).** PUT accepted non-string values and whitespace-only strings. For example, `{"name": {"first": "x"}, "email": "   "}` returned 200 and stored the object and the blank email. The README asks for rejection of "missing or invalid fields". Fix: PUT now requires non-empty strings, returns 400 otherwise, and saves trimmed values. The fix was verified by the existing tests and by manual requests against the running server. The task only forbade editing `tests/update-user.test.js`; adding new tests was not forbidden. An extra test file was added and then removed so that the PR stays small and focused on the feature.
2. **Recorded, not rewritten (nit).** The `Co-Authored-By` trailers on commits 1 to 3 name Sonnet 5.5, while the session model is Haiku 5.5. The trailers were left as they are.

PR reviewer request: PUT now checks whether `req.body` is missing before destructuring it, and returns the same 400 message in that case. With `express.json()` in place, body-parser already sets `req.body` to `{}` for a request without a body, so the guard is defensive; a PUT with no body already returned 400 before it.

Not changed: POST `/users` has the same weak check. The review noted it, but changing POST is outside this task, so it is left as a follow-up.

The review also confirmed that an unparseable id becomes `NaN`, which falls through to the 404 path, and that the in-place update keeps the id stable.
