# Notes — shipping `PUT /users/:id`

## The plan, and what I changed before approving it

The plan was read out of the tests rather than out of the brief, because `tests/update-user.test.js` is the real specification: update returns 200 with the new values, an unknown id returns 404, a missing field returns 400.

That gave three steps, in dependency order:

1. `db/store.js` — add an `updateUser(id, { name, email })` helper, since the brief requires all data access to go through the store.
2. `routes/users.js` — add the `PUT /:id` route on top of it, with validation and the not-found path.
3. `NOTES.md` — this file.

One thing I settled before writing any code, because it is a design decision and not a detail: **validation runs before the lookup.** A request to a non-existent id *with* a bad body therefore answers 400, not 404. Both orderings are defensible; I chose to fail fast on input the server can reject without touching data at all. The graded tests don't distinguish the two — test 3 uses id `1`, which exists — so this was a choice to make deliberately rather than discover by accident.

## Model

**Claude Opus 5.** The work is small, but it isn't mechanical: the ordering question above, the strictness of the validation, and reading the tests as a spec are all judgement calls where a wrong-but-plausible answer would still have turned the suite green. A cheaper model is the right call for a change whose shape is already fully decided; that wasn't the case here.

## Commit split

Three commits, one per layer, each one leaving the repo in a coherent state:

1. **`Add updateUser helper to the store`** — data layer alone. Reviewable on its own, and green: it adds an unused export without touching behaviour.
2. **`Add PUT /users/:id endpoint`** — the route, the validation, the 404. This is the commit that turns the graded endpoint tests green, so a bisect lands exactly here.
3. **`Add NOTES.md`** — write-up, no code.

The split follows the direction of the dependency: the store knows nothing about the route, so it comes first. Squashing them would have hidden which change actually made the tests pass.

## What the review caught

I probed the cases the graded tests *don't* cover, by running them rather than by reading the code:

| Case | Result |
|---|---|
| Non-numeric id (`/users/abc`) | 404 — `Number("abc")` is `NaN`, matches nothing. Same as the existing GET. |
| `name` empty, whitespace-only, `null`, or a number | 400 in every case |
| No body / non-JSON content type | 400, no crash |
| Malformed JSON | 400, handled by Express before the route runs |
| Extra field (`isAdmin: true`) | Ignored — destructuring `{ name, email }` means no mass assignment |
| `GET` after `PUT` | Change persisted, list not duplicated |

Nothing needed fixing. Two things are worth stating plainly rather than claiming a clean bill of health:

**The review confirmed more than it caught.** The only case that could have crashed was the destructuring of `req.body`, and that one is safe because `express.json()` assigns `{}` before it inspects the content type. I verified that instead of assuming it.

**There is a real inconsistency I chose not to fix.** `POST /users` validates with `!name || !email`, which accepts `name: 42` and `name: "   "`. My `PUT` rejects both. So the same payload can now be accepted on create and refused on update. Tightening POST would be the right fix, but it changes an endpoint this task didn't ask me to touch, and `tests/users.test.js` covers it — that belongs in its own change, not smuggled into this one.
