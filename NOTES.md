# Notes: PUT /users/:id ("update a user")

Adds an update endpoint to the users resource: `PUT /users/:id`, with input
validation, a not-found response, and data access through `db/store.js`,
following the same pattern as the existing `GET`/`POST` routes.

## The plan I approved

The approved plan was: add an `updateUser(id, { name, email })` helper to
`db/store.js` that returns the updated user or `undefined` if no user has
that id (mirroring the `undefined` contract `getUserById` already uses),
then add a `PUT /:id` route in `routes/users.js` that validates the body
first and only then looks the user up, returning 400 for invalid input, 404
for a missing user, and 200 with the updated user otherwise. Work was split
into a store commit, a route commit, and a docs commit.

Before approving, I asked Claude to choose between three validation
strictness options and picked the stricter one: a `isNonEmptyString` helper
that rejects missing, empty, whitespace-only, and non-string values, applied
only to the new `PUT` route. The existing `POST` route's looser
`!name || !email` check was left untouched, so no working behaviour changed
as a side effect of this feature. I also asked for the pre-push smoke checks
to be run against a live server automatically rather than by hand, and for
any review fixes to land as a separate follow-up commit rather than an
amend, so the history stays honest about what the review actually did.

## Model choice

Two models, split by stage. **Opus 5** for planning: the design decisions
(the store's `undefined`-for-missing contract, how strict validation should
be, validating before the lookup, how to split the commits) are where a
wrong call would have been expensive to unwind, and as a Data Analyst rather
than a JavaScript developer I was relying on the model's judgement there,
not just its typing speed. **Sonnet 5** for implementation: once the plan
was approved, the remaining work was a well-specified ~25-line diff with
`npm test` and `npm run lint` as objective correctness checks, so the
faster, cheaper model was the right fit for executing an already-agreed
design.

## Commit split

Three commits: `db/store.js` (the `updateUser` helper), `routes/users.js`
(the `PUT /:id` route), then this file. The store change is a standalone
data-access contract, kept separate from the HTTP layer that uses it. The
route commit is the one that turns `tests/update-user.test.js` green, so
`git log` shows exactly where the feature landed. Each commit leaves the
tree in a working, test-passing state on its own (the store commit alone
changes no observable behaviour; the route commit alone makes all three
update-user tests pass). Docs went last so this file could describe the
review that only happens after the code exists.

## What the review caught

I ran `/code-review` (medium effort) against the branch diff before pushing.
It reported **no findings** — an empty result, not "review not run". No
follow-up commit was needed.

Beyond the automated review, I ran live smoke checks against a real running
server (not just the three graded tests), covering cases the grading tests
don't touch:

- Happy path (`PUT /users/1` with a valid body) → `200` with the updated
  user, and a follow-up `GET /users/1` confirmed the change persisted
  through the store, not just in the response.
- Whitespace-only name (`"   "`) → `400`.
- Non-string field (`name: 123`) → `400`.
- Extra unknown key in the body (`admin: true`) → `200`, and the key was
  silently dropped rather than written to the record, confirming
  `updateUser` only ever assigns `name` and `email`.
- Non-numeric id (`/users/abc`) and unknown numeric id (`/users/9999`) →
  both `404` with a clean JSON body, no crash.
- `GET /health` after all of the above → still `200`, confirming the
  process stayed up through every case, including the invalid ones.

Everything the review and the smoke checks confirmed was already fine, so
the endpoint shipped as designed in the approved plan with no changes.
