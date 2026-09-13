My choice was to use Opusplan to plan the built with Opus and afterwards execute it with Sonnet. Here you find notes Claude jotted down.


# NOTES

## The plan I approved

The plan was to add `PUT /users/:id` in two layers, following the existing patterns in the repo:

- an `updateUser(id, { name, email })` helper in `db/store.js`, reusing `getUserById` and
  returning `undefined` for a missing user (same convention as the rest of the store)
- the route itself in `routes/users.js`, validating `name`/`email` with the exact same falsy
  check `POST /users` already uses, checked *before* the store lookup so a missing field 400s
  even for a user id that exists — that ordering was the key edge case from the tests
- a `NOTES.md` write-up, drafted by Claude and edited by me before committing

Before approving, I was asked two clarifying questions: how strict the validation should be
(I chose to match `POST /users` exactly rather than add stricter type/format checks, to keep
the two write endpoints consistent), and whether to draft this file (I chose to have it
drafted and then edit it myself). I didn't change anything else in the plan — it already
matched the test file and the README's description of the feature.

## Model choice

I used Claude Code's "opusplan" mode: Opus 5 for planning, Sonnet 5 for implementation. The
task is a small, well-specified endpoint with a test file that pins down the exact behavior, so
the heavier model was worth it only for reading the codebase and designing the approach —
implementation didn't need more than a capable, fast model once the plan was set.

## Commit split

Three commits, each independently green:

1. `db/store.js` — the `updateUser` helper
2. `routes/users.js` — the `PUT /users/:id` route that uses it
3. this `NOTES.md`

I split the store change from the route change because they're reviewable separately: the
first is a pure data-layer addition, the second is the HTTP-facing behavior (validation,
status codes) built on top of it. Keeping `NOTES.md` in its own commit keeps the code commits
focused on the actual feature.

## What review caught

The review didn't find a bug, but it checked two edge cases the provided tests don't exercise
directly, since validation runs before the store lookup:

- a non-numeric id (`PUT /users/abc`) — `Number("abc")` is `NaN`, and `NaN === NaN` is `false`,
  so the store's `find` correctly falls through to `undefined` and the route 404s instead of
  crashing
- an empty body (`{}`) on a user id that *does* exist — the 400 still fires, confirming the
  validation-before-lookup ordering the tests require for the "missing field" case also holds
  for the "no body at all" case

Both were verified manually against a running `npm run dev` server with `curl`, in addition to
the automated test suite. Nothing needed changing as a result — the design from the plan already
covered them.
