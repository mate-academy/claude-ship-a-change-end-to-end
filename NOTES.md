# NOTES

## Plan
Plan mode first, read-only. The approved plan was:
1. Add `updateUser(id, { name, email })` to `db/store.js`. It returns `undefined` for an unknown id, like `getUserById`.
2. Add `PUT /:id` to `routes/users.js`. Validate, call the store, and return 404 or 200.
3. Write this file.

I did not edit the plan before approving it. Exploration found that `CLAUDE.md` is not in the repo, so I took the conventions from the existing routes and store.

## Decisions
- **All data access goes through `db/store.js`.** The route never touches the array.
- **Validation runs before the lookup.** A malformed body returns 400 whatever the id. `name` and `email` must be non-empty strings after trimming. `email` must match `/^[^\s@]+@[^\s@]+$/`: text, a single `@`, text, no whitespace. This is deliberately minimal, not a full RFC regex. It was first just "contains `@`" and was tightened after review.
- **Stricter than POST.** POST only checks truthiness. I left POST unchanged to keep the change scoped.
- **Unknown or non-numeric id returns 404** with `{ error: "User not found" }`, the same as GET.
- **PUT is a full replacement.** Both fields are required, so there are no partial updates.
- Values are trimmed before they are stored.

## Model
Claude Sonnet 5.5. This is a small change with a clear spec and tests, so a fast mid-size model was enough. A larger model would not have added value.

## Commits
1. `feat(store): add updateUser helper`: the data layer on its own.
2. `feat(users): add PUT /users/:id with validation and 404`: the route that uses it.
3. `docs: add NOTES.md`: the write-up.

A fourth commit was added after review: `fix(users): tighten email validation and review notes`.

Each of the first three commits is one logical change, and the store helper lands before the code that depends on it.

## Review
I reviewed the three commits by reading the code and probing the endpoint with about 17 requests (valid update, missing body, blank/whitespace/non-string fields, malformed emails, non-numeric and unknown ids, an `id` in the body, malformed JSON). I also confirmed that `tests/` is unchanged and that GET, POST and health are not affected.

- **No critical problems were found.** All tests and lint passed.
- **Fixed:** the email check only required an `@`, so `"@"` and `"a b@c"` were accepted. It now uses the minimal pattern described above. This went in as a follow-up commit, `fix(users): tighten email validation and review notes`, on top of the original three.
- **Left out of scope:**
  - Malformed JSON bodies return `400 {}` with a stack trace logged. This comes from `express.json()` in `server.js` and already affects POST.
  - Id parsing is lenient (`Number()` accepts `1e0` or `0x1`). GET behaves the same way, so tightening it would mean changing existing routes.
- **Also noted, unchanged:** duplicate emails are allowed, as in POST.
