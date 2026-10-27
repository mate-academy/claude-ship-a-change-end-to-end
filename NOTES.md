# NOTES

## Plan I approved
I read `tests/update-user.test.js` first and ran `npm test` to see it red (404 instead of 200/400). The plan, made in plan mode, was: add `updateUser(id, { name, email })` to `db/store.js` (returns `undefined` when the id is unknown), then add `PUT /users/:id` to `routes/users.js` following the existing GET/POST pattern. Validation runs before the lookup (400), an unknown id gives 404 with the same message as `GET /users/:id`, and success returns 200 with the updated user. The plan also covered `NOTES.md` and the push/PR steps. I approved it without editing it. It went slightly beyond `POST` by requiring non-empty strings instead of just truthy values.

## Model
I used an `opusplan`-style split: Opus 5.5 for the plan, because that is where the design decisions are (validation order, where the 404 comes from, which files to touch), and Sonnet 5.5 for the implementation, because the change is small and mechanical once the plan exists. Opus for the whole thing would have cost more for no extra quality on ~30 lines of code.

## Commit split
1. `feat(store): add updateUser helper` — the data layer on its own, so the route has something to call.
2. `feat(users): add PUT /users/:id with validation and 404` — the endpoint; this is the commit that turns the update-user tests green.
3. `fix(users): store trimmed name and email on update` — a fix found in review, kept separate so the review finding is visible in the history.
4. `docs: add NOTES.md` — the write-up, which turns the NOTES tests green.

## What the review caught
One real issue: validation used `trim()` to reject blank values, but the untrimmed input was saved, so `"  Grace  "` kept its spaces. Fixed in commit 3. It confirmed these were already fine: a non-numeric or fractional id (`abc`, `1.5`) just falls through to 404, and a missing JSON body is handled by `req.body || {}` instead of throwing. Not changed on purpose: `POST /users` is looser than `PUT` (it accepts non-strings and blank values). That is out of scope here, but worth a follow-up so both endpoints validate the same way.
