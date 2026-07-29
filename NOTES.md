# NOTES

## The plan I approved

The plan was to add `PUT /users/:id` in two layers: an `updateUser` helper in `db/store.js`
that reuses the existing `getUserById`, and a route handler in `routes/users.js` that goes
through that helper rather than touching the data directly — matching how every other route
in the file already works. Plus a `NOTES.md`, since `tests/notes.test.js` grades it.

I made two edits before approving. The first plan left the order of the 404 and 400 checks
unstated; both provided tests pass either way, because the 404 test sends a valid body and
the 400 test uses an id that exists, so the two cases never overlap in the test suite. I
pinned it down: check that the user exists first, so `PUT /users/9999` with a broken body
answers 404 rather than 400. That mirrors the sequence `GET /users/:id` already uses. The
second edit was to validation strictness — I chose the same `!name || !email` check and the
same error string as `POST /users`, instead of adding type and whitespace checks that the
existing create path doesn't have. Tightening one write path and not the other would be worse
than either choice applied consistently, and tightening both would have put unrelated changes
in this PR.

## Model choice

Claude Opus 5. The feature itself is small, but the work around it wasn't: the repo needed
recovering from a bad state first, and the decisions worth getting right here were judgment
calls (check ordering, how far to take validation, what belongs in this PR) rather than
typing. Opus caught that the ordering question was underspecified and that one of the four
"failing" tests was actually passing for the wrong reason. A cheaper model would likely have
made the tests green without surfacing either.

## Commit split

Three commits, each understandable without opening the diff:

1. **`Add updateUser helper to the in-memory store`** — the data layer alone. No API behaviour
   changes; the helper is unused at this point.
2. **`Add PUT /users/:id endpoint`** — the route. This is the commit that turns the three
   update-user tests green, so the diff and the behaviour change land together.
3. **`Add NOTES.md write-up`** — documentation, kept out of the code commits.

Split by layer, because that's the order the change was actually reasoned about, and because
it lets a reviewer check the store contract before seeing how the route depends on it. The
`git log` reads as a description of the feature rather than a record of my typing.

## What the review caught

The tests going green isn't the same as the change being right, so I checked the paths the
tests don't cover, against a running server:

- **Non-numeric id** (`PUT /users/abc`) → 404, not a 500. `Number("abc")` is `NaN`, which
  matches no user. Confirmed fine, not just assumed.
- **Unknown id with a bad body** (`PUT /users/9999` with no email) → 404, which is the
  precedence I chose. No test covers this; it would have gone either way silently.
- **Malformed JSON** → 400 from `express.json()`, server survives.
- **The update actually persists** — a follow-up `GET /users/1` reflects the new values,
  confirming the in-place mutation keeps the object's identity inside the `users` array.

Two things review flagged that I decided **not** to change. First, the route calls
`getUserById` and then `updateUser`, which looks the user up twice. That redundancy is the
price of answering 404 before 400, and on an in-memory array of three records it costs
nothing; collapsing it would mean giving up the ordering I deliberately chose. Second,
`Number()` accepts `"1e0"` as id 1, so `PUT /users/1e0` updates Ada. That looked like a bug
until I checked `GET /users/1e0` on the pre-existing route and got the same coercion — it's
the established behaviour of this codebase, not something I introduced, and fixing it belongs
in its own change that touches both routes.

Verified before pushing: `npm test` green (9/9) and `npm run lint` clean. CI runs lint before
tests, so a lint failure would break the build even with passing tests.
