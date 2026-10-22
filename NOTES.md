# Notes: PUT /users/:id

## 1. Goal

Implement `PUT /users/:id` so an existing user's `name` and `email` can be
updated. The endpoint returns `200` with the updated user, `404` when the user
does not exist, and `400` when the input is missing or invalid. All data access
goes through `db/store.js`, following the pattern the existing routes use.

## 2. Approved Implementation Plan

The plan was written in plan mode (read-only) and approved before any code
changed. Two adjustments were made when approving it:

- Do not create a `CLAUDE.md` for this project (the repo does not contain one).
- Write this file last, after implementation and review, using the real
  commits and findings.

The plan:

1. **`db/store.js`**: add `updateUser(id, { name, email })`. It returns
   `undefined` when the user does not exist and writes only `name` and `email`,
   so an `id` can never be changed through it.
2. **`routes/users.js`**: add `router.put("/:id", ...)`. It validates the input,
   calls `store.updateUser()`, and maps the result to `200`, `400` or `404`.
   `server.js` needed no change because the users router was already mounted.
3. Keep `GET`, `POST` and the test files untouched.
4. Review the diff, fix real findings, then write these notes.

## 3. Model Choice

Claude Sonnet 5.5 implemented the change. This is a small, well-specified
change: one store helper and one route, with tests that define the behaviour.
A mid-tier model is capable enough for that, and it is faster and cheaper than
the largest model. The extra reasoning depth of a larger model would add cost
without improving the result here.

For accuracy: the planning step ran earlier in the session on Claude Opus 5.5.
The store change, route change, code review and these notes were done on
Sonnet 5.5. The review was therefore done by the same model that wrote the
code, so it is a useful second pass but not an independent one.

## 4. Commit History

Branch `feat/update-user`, one logical change per commit:

| Commit | Message | What it contains |
|---|---|---|
| `d7aee09` | `feat(store): add updateUser helper` | The data-layer helper alone, so the route has something to build on. |
| `68ae648` | `feat(users): add PUT /users/:id with validation and 404` | The endpoint. The three update-user tests turned green here. |
| `be78295` | `fix(users): tighten PUT id and email validation` | Two fixes from the code review (section 5). |

Keeping the review fixes in their own commit means the review's effect is
visible in history and can be reverted on its own.

## 5. Code Review Findings

The review exercised the endpoint with extra requests beyond the provided
tests (bad ids, bad bodies, odd emails) and read the diff against the existing
routes. The core behaviour was correct: validation runs before any write, the
body cannot change the id, and the response shapes match the existing routes.
Two issues were worth fixing:

1. **Non-canonical user IDs were accepted (Medium).** The route used
   `Number(req.params.id)`, which converts `1.0`, `1e0` and `0x2` into valid
   ids. For example, `PUT /users/0x2` updated user 2.
   *Fix:* the id must match `/^[1-9]\d*$/` (a canonical positive integer).
   Anything else, including `abc`, `0`, negatives and `01`, returns `404`
   `User not found`.
2. **Email validation was too permissive (Low).** The check was
   `email.includes("@")`, so `@` and `a b@c` were accepted.
   *Fix:* the trimmed email must match `/^[^\s@]+@[^\s@]+$/`: exactly one `@`,
   text on both sides, no whitespace. This is still a deliberately simple
   check, not full RFC validation; `a@c` passes.

Behaviour choices worth knowing: `name` and `email` are trimmed before saving,
and a malformed id returns `404` (not `400`) to stay consistent with
`GET /users/:id`.

### Known limitations, left out of scope

- **Duplicate emails are allowed.** Updating a user to another user's email
  succeeds. `POST` has the same behaviour, and rejecting duplicates would
  change the API contract.
- **No field length limits.** A very long `name` is accepted. Only Express's
  default 100 kb body limit applies.
- **`POST` validation is weaker than `PUT`.** `POST` only checks that `name`
  and `email` are truthy, so it accepts non-string values and bad emails that
  `PUT` would reject.
- **Malformed JSON returns an HTML error page.** This is Express's default
  `express.json()` behaviour (still status `400`) and applies to every route.
  Fixing it needs a global error handler.
- **`GET /users/:id` still accepts non-canonical ids** such as `0x2`, since the
  fix was limited to `PUT` as requested.

## 6. Verification

- `npm test`: 9 tests in total. All 9 pass, including the three
  `tests/update-user.test.js` tests (update returns `200`, unknown user
  returns `404`, missing field returns `400`), the four existing
  `GET`/`POST`/health tests, and the two `NOTES.md` tests in
  `tests/notes.test.js`. Before this file existed, the two `NOTES.md` tests
  were the only failures.
- `npm run lint`: passes with no errors.
- Manual checks during review, run against the app in memory: invalid ids
  (`abc`, `1.0`, `1e0`, `0x2`, `0`, `-1`) return `404`; invalid emails (`@`,
  `a b@c`, no `@`, empty, whitespace only) return `400`; valid ids and emails
  return `200`. These are not part of the committed test suite.

## 7. Scope and Remaining Limitations

- No test files were modified.
- `GET`, `POST` and the health route were not changed. The diff against `main`
  touches `db/store.js`, `routes/users.js` and this file only.
- This is a small API on an in-memory store. Data resets on every restart,
  there is no authentication or authorization, no persistence, and no
  concurrency handling. It is a teaching project, not a production-ready user
  service, and the validation is intentionally lightweight.
