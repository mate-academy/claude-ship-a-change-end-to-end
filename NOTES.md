# NOTES — PUT /users/:id

## Plan
I asked for a plan first (plan mode) and had it read `tests/update-user.test.js` before anything else. The plan I approved:
- `db/store.js`: add `updateUser(id, { name, email })`, following the pattern of `getUserById`/`createUser`. It looks the user up with `getUserById`, changes it in place and returns `undefined` when the id isn't found.
- `routes/users.js`: add `PUT /:id`. It first checks that `name` and `email` are non-empty strings (400 with a clear error otherwise), then calls `store.updateUser`. It returns 404 `"User not found"` if the user doesn't exist and 200 with the updated user on success.
- The test file shapes the order: `PUT /users/1` with only `name` must be a 400 even though user 1 exists, so input has to be checked before the lookup.
- It also pointed out that `tests/notes.test.js` would stay red until this file existed.

I didn't approve the first version as it was. Before approving, I added a requirement: build it in two logical commits (store first, then route), with commit messages written from the diff and `npm test` run after each one. The plan was updated with that split and then approved.

## Model
I used Opus 5.5, the default. The change is small, but getting it right depended on careful reading more than on typing speed. The model had to notice that the 400 test only passes if input is checked before the lookup, and that the shared in-memory store is reused across tests. The review step also needed reasoning about edge cases (id coercion, trimming, whether a test really proves anything), not just applying a fix. A stronger default model fits that better than a faster, cheaper one. The extra cost on a change this size is small.

## Commits
1. **`ebd8a58` Add updateUser to the in-memory store**: the data layer only. After it, `npm test` had 4 expected failures (the route didn't exist yet, and NOTES.md was missing).
2. **`7057411` Add PUT /users/:id to update a user's name and email**: the route, the input check and the 404 path. All 3 grading tests passed after it.
3. **`cb0b9b0` Harden PUT /users/:id: trim input, reject malformed ids, add edge tests**: the fixes from the review, kept separate so the original feature and the fixes can each be read on their own.
4. **This commit**: NOTES.md.

I split them this way so each commit is one layer or one concern, can be reviewed without opening the others, and leaves the tests in a known state.

## Review
I asked for a review of the branch against `main` before fixing anything. Findings were checked by sending real requests to the app, not just by reading the code.

**Fixed on this branch (commit 3):**
1. **Trimming:** input was checked after trimming but saved untrimmed, so `"  Pad  "` was saved with its spaces. Values are now trimmed before saving.
2. **Id coercion:** `Number(req.params.id)` turned `0x1`, `1.0` and `1e0` into `1`, so `PUT /users/0x1` updated user 1, and `abc` turned into a 404. Ids must now be plain positive integers, otherwise 400.
3. **A 404 test that proves nothing:** the grading 404 test already passed before the route existed, because Express's default 404 answered it. I couldn't edit that file, so a new `tests/update-user-edge-cases.test.js` checks the 404 body, a GET after a PUT, the trimming, the 400 cases for bad values and the bad ids.

**Left for a separate change, and why:**
- **Malformed JSON / a bare `null` body returns Express's HTML 400 page and logs a stack trace.** It happens before any route runs and affects every endpoint. The fix belongs in `server.js` (a JSON error handler), not in this feature.
- **POST validation is looser than PUT** (it accepts `5` or `"  "`). Fixing that changes how an existing endpoint behaves, which is out of scope here.
- **GET `/users/:id` uses the same `Number()` coercion.** It was already there before this branch, and commit 3 was kept to PUT only.
- **The 400 error doesn't say which field is wrong**, and **email format isn't checked.** Both are minor and weren't asked for.

## Results
After commit 3: `npm run lint` was clean, and `npm test` had 20 of 22 passing, with only the two NOTES.md tests failing. This file is meant to make those pass.
