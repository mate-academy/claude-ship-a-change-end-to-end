# Notes on shipping `PUT /users/:id`

## The plan, and what I changed before approving

The plan came out of reading the three existing users routes, `db/store.js`, and
`tests/update-user.test.js` — the tests already pin the contract, so the plan was
mostly about matching the conventions already in the repo: a `updateUser` helper in
the store alongside `getUserById`/`createUser`, then a thin route handler that
validates first, calls the store, and maps a missing user onto a 404.

Two things got settled before I approved it:

- **How strict the validation should be.** The tests only require a 400 when a field
  is missing, and `POST /users` gets away with a truthiness check. I chose to go one
  step further on the new endpoint — require `name` and `email` to be non-empty
  *strings* — because `{"name": 42}` would otherwise reach `.trim()` and throw a 500.
  I deliberately stopped short of an email-format regex: `POST /users` doesn't do one,
  and having create and update disagree about what a valid email is would be worse
  than having neither check it.
- **Scope.** `tests/notes.test.js` was also red, so "make `npm test` green" meant
  writing this file too, not just the endpoint.

## Model choice

Opus 5. The feature itself is small, but the work around it isn't purely mechanical —
picking the validation strictness, deciding the 400-before-404 ordering, and keeping
the new code consistent with conventions that are implied rather than written down
are judgment calls, and that's where the stronger model earns its keep. On a change
that was genuinely one obvious edit, Sonnet would have been the right call.

## Commit split

Three commits, bottom-up:

1. `store: add updateUser helper` — the data layer alone.
2. `users: add PUT /users/:id endpoint` — the HTTP behavior.
3. `docs: add NOTES.md` — this file.

The split follows the dependency direction, so each commit stands on its own and the
first two are separately revertable. It also means a reviewer who only cares about the
API contract reads exactly one commit, and the store change — the part that touches
shared state used by every other route — is isolated where it's easy to scrutinize.

## What the review caught, and what it confirmed

- **A stray `PLAN.md` in the first commit.** I staged with `git add -A` and swept in an
  untracked file that isn't part of this change. Caught it on the commit's `--stat`,
  reset and recommitted with only `db/store.js`. The habit fix is staging by path.
- **An undefined helper.** The route referenced `isNonEmptyString` before I'd written
  it; the editor's diagnostics flagged it immediately, and `npm run lint` would have
  failed CI on it — lint is a hard gate ahead of tests in `.github/workflows/ci.yml`.
- **An id guard that didn't match its own error message.** The review flagged that
  `Number(req.params.id)` accepts far more than the `"id must be a number"` message
  implies: `0x2`, `+2`, `2e0`, `2.0` and a URL-encoded `%202` all coerce to `2`, so
  `PUT /users/0x2` quietly overwrote user 2 with a 200. The tests never would have
  caught it — they only try a well-formed id and a fully non-numeric one. Fixed by
  matching `/^\d+$/` against the raw param before converting.
- **Confirmed fine: validation runs before the store lookup.** So `PUT /users/1` with a
  missing `email` is a 400, not a 200 with a half-applied update. The tests don't
  exercise the conflicting case (unknown id *and* a missing field), so the ordering is
  a deliberate choice rather than something the suite would have caught: a malformed
  request is rejected on its own terms before existence is even considered.
- **Confirmed fine: in-place mutation in the store.** `updateUser` mutates the object
  `getUserById` returns rather than replacing the array element, so `getAllUsers()`
  reflects the change and no id is ever reassigned. Verified by curl — updating user 1
  and then re-reading both `/users/1` and `/users`.

Beyond `npm test`, I exercised the running server directly: a successful update and
read-back, an unknown id (404), a missing field, a whitespace-only name, a non-string
name, an absent body, and a non-numeric id (`/users/abc` → 400, not a crash).
