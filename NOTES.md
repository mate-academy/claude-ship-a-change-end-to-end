# Notes: `PUT /users/:id`

## What was in the plan I approved, and did I edit anything?

I approved the plan as proposed, with two additions: I had `NOTES.md` drafted up front so I could edit it, instead of written last, and I asked for the tests to be run after each round of changes to confirm they still passed.

The plan had three parts:

1. Add an `updateUser(id, { name, email })` helper to `db/store.js`. It returns `undefined` for an unknown id, matching `getUserById`.
2. Add `PUT /:id` to `routes/users.js`, following the existing handlers. It validates first (400 if `name` or `email` is missing, empty, or not a string). Then it looks the user up (404 `User not found` if absent). Otherwise it returns 200 with the updated user.
3. Write `NOTES.md`. In the original plan this came last, once the details were settled. I moved the first draft to the start, then updated it as the work and review finished.

Validation runs before the lookup, so bad input always gets a 400, even for an id that doesn't exist. Only `name` and `email` are copied from the body, so a client can't overwrite `id`.

## Which model did I choose, and why?
- The model used was sonnet. I chose because of the task not being a major one so Opus would have been overkill


## How did I split my commits, and why?

One logical change per commit:

1. `Add updateUser helper to store`. Data access only, no HTTP concerns.
2. `Add PUT /users/:id endpoint with validation and 404`. The route that uses the helper. This commit turned the update-user tests green.
3. `Reject non-canonical ids on PUT /users/:id`. A review fix, kept separate so the id change is easy to read and revert.
4. `Share input validation between POST and PUT`. A second review fix. It touches POST too, so it gets its own commit.
5. `Add NOTES.md`. Documentation, kept separate from the code.

The store change comes first so each commit builds on a working base and can be understood or reverted on its own. The review fixes are separate commits, not folded into commit 2, so the history shows what the review changed.

## What did my review catch, or confirm was fine?

I ran `/code-review`, which flagged six things. I reproduced the route-related ones against the running app before deciding what was real.

**Caught and fixed:**

- **Id aliasing.** `Number(req.params.id)` accepted `1.0`, `0x1` and `1e0`, so `PUT /users/1.0` updated user 1. Several URLs for one resource is wrong for a write endpoint. The route now only accepts plain digit ids, and anything else returns the same 404 as an unknown user.
- **POST and PUT disagreed on valid input.** `POST /users` with `{name: 123, email: ["x"]}` returned 201 and stored it, while PUT rejected the same body. A user could be created that couldn't be re-submitted via PUT. Both routes now share one `parseUserInput` helper. This is a behavior change to POST: it now rejects non-string and blank values and trims them.

**Confirmed fine:**

- The not-found path: an unknown id, `abc` and `-1` all return 404 and don't crash.
- Validation runs before the lookup, so bad input always gets a 400, and a missing body is treated as empty.
- `id` can't be changed through the request body, because only `name` and `email` are copied.

**Noticed but deliberately left alone (out of scope for this change):**

- `store.updateUser` trusts its caller and doesn't check its arguments. `createUser` doesn't either, and the route validates before calling it.
- No email format or uniqueness check. POST never had one, and the task doesn't ask for it. Two users can share an email.
- Malformed JSON gets Express's default HTML 400 page instead of a JSON error. This comes from `express.json()` and affects every route, so the fix is a global error handler in `server.js`.
