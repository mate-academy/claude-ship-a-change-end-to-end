# Notes — shipping `PUT /users/:id`

## The plan

Two files, one small change each: a `updateUser` helper in `db/store.js`, and a
`PUT /:id` route in `routes/users.js`. I read `tests/update-user.test.js` first
and let it define the contract — 200 with the updated body, 404 for an unknown
id, 400 for a missing field — then planned the edges the tests don't cover.

## Choices

**Full replace, not a partial update.** The provided test sends `{ name: "Only
a name" }` and expects a 400, so `PUT` here means "replace both fields." That
matches `PUT` semantics anyway; a merge-style partial update would be a separate
`PATCH` endpoint. Both `name` and `email` must be non-empty strings, and the
email is shape-checked against a deliberately loose pattern — enough to catch an
obvious typo without pretending to implement RFC 5322.

**Validate the body before looking the user up.** A malformed request is a client
error whether or not the id happens to exist, so the 400 fires first. The
provided tests pass under either ordering (the 404 case sends a valid body, the
400 case targets an id that exists), so this was a judgement call, not a
constraint.

**Validation in the route, persistence in the store.** `updateUser` returns
`undefined` when the id is missing rather than throwing or sending a response,
so the "not found" decision stays in the route layer — exactly how `GET /:id`
already works. It reuses `getUserById` instead of a second `users.find(...)`,
and mutates the record in place so `GET /users` reflects the change immediately.

**A known inconsistency, left alone on purpose.** `PUT /users/abc` returns 400
("id must be an integer"), but `GET /users/abc` returns 404 today — `Number("abc")`
is `NaN`, so the lookup just misses. Making the two agree means touching `GET`,
which is outside this change; flagging it here beats silently widening the diff.

## Model and commits

Written with Claude Opus 5 in Claude Code, planned in plan mode before any edit.
Three commits, each independently reviewable: the store helper, then the route,
then this write-up.

## What the review caught

Two things worth fixing. The first draft leaned on the same falsy check as
`POST /users` (`!name || !email`), which lets `{ name: " " }` through as a valid
name — hence `isNonEmptyString` and trimming the values before they reach the
store. The second was the invalid-id gap above: I noticed it only when writing
the smoke tests by hand, and chose to document rather than quietly change `GET`.

Verified with `npm test` (9/9), `npm run lint` clean, and a manual `curl` pass
over all five response paths plus `GET /users` to confirm the update persisted.
