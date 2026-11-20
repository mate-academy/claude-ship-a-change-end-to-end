# NOTES

## Plan
The approved plan adds `PUT /users/:id` through `db/store.js`. Before approval we tightened three points: `name` and `email` must be non-empty strings (whitespace-only counts as empty, but values are saved as sent, with no auto-trim and no email format check); the order of checks is 400 for invalid input, then 404 for an unknown user, then 200; commits carry no Co-Authored-By trailer.

## Model
The implementation and review were done with Haiku 5.5 (`claude-haiku-5-5`), as reported by the session environment. The plan had named Sonnet 5.5 as the model to keep; the model actually used differs from that, and this section records the actual one. The task is small, with few files and tests already written, so a lighter model was enough.

## Commit split
The change is split into three commits, in this order:
1. `db/store.js`: the `updateUser` helper. It is added first so the route can depend on it.
2. `routes/users.js`: the `PUT /users/:id` route with validation and the 404 path.
3. `NOTES.md`: this write-up.

Each commit is a single logical change, so it can be read and reverted on its own.

## Review
The review was done by reading the diff and running a temporary script of edge-case checks outside the project. The checks covered:
- Invalid `name`/`email` (missing, empty, whitespace-only, number, null, array, object, boolean) return 400, and the stored user is unchanged afterwards.
- A request with no body returns 400.
- Unknown ids (`9999`, `0`, `-1`, `1.5`, `abc`) with a valid body return 404.
- An invalid body on an unknown id returns 400, so validation runs before the lookup.
- A valid update returns 200, keeps the id, ignores `id` and extra fields in the body, and is visible through GET.

Findings:
- No defects were found in the endpoint, so no code was changed after the review.
- Whitespace around a valid value is saved as sent (`"  Padded  "`). This follows the approved plan (no auto-trim), but a reviewer may want trimming; it is a decision, not a bug.
- Malformed JSON returns 400, but the body is Express's default HTML error page. This is existing behaviour shared by every route, so it was left alone.

Test results: `npm test` runs 9 tests, all pass. `npm run lint` passes.
