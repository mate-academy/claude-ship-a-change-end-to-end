# Notes — update-user endpoint

**The plan.** Add `PUT /users/:id` following the two patterns already in
`routes/users.js`: the 400/validation shape from `POST /` (reject if
`name` or `email` is missing) and the 404/not-found shape from
`GET /:id`. On the data side, add a single `updateUser(id, { name, email })`
helper to `db/store.js` that mirrors `getUserById` — looks the user up,
returns `null` on a miss, otherwise mutates and returns it. I approved the
plan as written; the one thing I checked closely before approving was the
order of the two checks (validate the body vs. look up the id first).
`PUT /users/1` with a missing field must return 400 even though id 1
exists, so I made validation run before the existence check — that also
means an invalid body against an unknown id returns 400 rather than 404,
which felt like the more standard REST behavior anyway.

**Model.** Claude Sonnet 5. The task is a small, well-scoped feature with
an existing pattern to copy almost directly (two ~15-line additions) —
nothing here needed heavier architectural reasoning, so the faster/cheaper
model was the right fit.

**Commits.** Split by file/layer rather than by "the feature" as one blob:
1. `feat: add updateUser to the in-memory store` — `db/store.js` alone.
2. `feat: add PUT /users/:id with validation and 404 handling` —
   `routes/users.js` alone; this is the commit that turns the grading
   tests green.
3. `docs: add NOTES.md` — this file.

Each commit is independently reviewable (data layer vs. HTTP layer) and
each leaves the repo in a working state (`npm test` doesn't newly break
between them), which is why I didn't just squash it into one commit.

**Review.** Self-reviewed the diff before opening the PR: checked the
validate-then-404 ordering (see above), checked that `store.updateUser`
mutates the same array entry `getUserById`/`getAllUsers` read from rather
than a copy (so the update is actually visible afterward), and checked
`Number(req.params.id)` on a non-numeric id — it becomes `NaN`, which never
matches an id in `find`, so it falls through to 404 rather than crashing.
Ran `npm run lint` too; it came back clean. Nothing needed fixing — the
review mostly confirmed the pattern-matching approach held up, rather than
catching a new bug. One deliberate scope call, not a bug: validation only
checks that `name`/`email` are present/truthy, the same depth as the
existing `POST /` handler — no email-format or type checks, since neither
the existing code nor the provided tests ask for that.
