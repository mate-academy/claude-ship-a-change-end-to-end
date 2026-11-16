# Notes

## Plan
I planned in plan mode before touching code. The approved plan had two pieces:
an `updateUser` helper in `db/store.js`, and a `PUT /users/:id` route in
`routes/users.js` that goes through it. Decisions in the plan: PUT means full
replacement, so both `name` and `email` are required; the user lookup runs
before validation, so an unknown id is always 404; blank or non-string values
are 400. I approved the plan without edits.

## Model
Claude Opus 5.5 for planning, and Claude Sonnet 5.5 for the implementation.
The change is small and well specified by the tests, so a fast model was
enough for the code, while the planning pass was where the edge cases
(lookup order, validation rules) were worth thinking through.

## Commits
1. `Add updateUser helper to the in-memory store` — data layer only.
2. `Add PUT /users/:id endpoint with validation and 404` — the route.
3. `Add NOTES.md ...` — the write-up.

One logical change per commit, following the existing layering (store, then
route), so each commit can be read and reverted on its own.

## Review
I probed the endpoint by hand. Confirmed fine: blank, non-string and missing
fields give 400; an unknown or non-numeric id gives 404; an `id` in the body is
ignored and the user's id never changes; values are trimmed; a missing body
gives 400 instead of crashing. The review found nothing that needed a fix.
Not covered: email format validation, which the existing POST route doesn't do
either, so I kept the two consistent.
