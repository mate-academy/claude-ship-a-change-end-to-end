# Notes: PUT /users/:id (update a user)

**The plan I approved, and edits.** The plan added a `updateUser(id, { name, email })`
helper to `db/store.js` (mirroring `getUserById`'s lookup and `createUser`'s
destructured params, mutating in place and returning `undefined` on no match)
and a `PUT /:id` handler in `routes/users.js` that validates `name`/`email`
before calling the store, matching the existing `POST /` handler's order and
error shapes. I approved it as drafted — no edits were needed going in,
because the recon step confirmed there was only one existing validation
convention in the repo (`!name || !email`) to match, which resolved the one
open design choice (validate-first vs. look-up-first) before I had to decide
it myself.

**Model choice.** Sonnet. This is a small, well-specified change against an
already-written test file, so there wasn't a need for heavier reasoning —
the harder work was confirming the existing conventions to follow, not novel
design.

**Commit split.** Three commits, one logical change each:
1. `updateUser` helper in `db/store.js`
2. the `PUT /:id` route in `routes/users.js`
3. a small review fix (below)

Splitting the store change from the route change means each commit is
independently reviewable and revertible — the data-layer change and the
HTTP-layer change are different concerns even though they were built for the
same feature.

**What review caught.** A self-review across correctness, removed-behavior,
cross-file impact, reuse, simplification, efficiency, altitude, and
convention checks turned up one real issue: `updateUser` re-implemented the
same `users.find((user) => user.id === id)` lookup that `getUserById` already
does, instead of calling it — a small duplication that risked drifting if the
lookup logic ever changed. Fixed in commit 3. Everything else came back
clean: no correctness bugs, no missed edge cases (non-numeric `:id`, missing
fields, extra body fields), and a second candidate finding (mutation-by-
reference on the objects `getUserById`/`getAllUsers` return) was checked and
refuted — no code in the repo holds a reference across requests, and that's
a pre-existing pattern in the store, not something this change introduced.
