# NOTES.md

## The plan

I asked Claude Code to plan the `PUT /users/:id` endpoint in plan mode. It explored the existing routes and store first, then proposed: a `store.updateUser(id, { name, email })` helper that returns `undefined` for a missing user (mirroring `getUserById`'s miss signal, so the route can reuse the same `if (!user)` guard as `GET /:id`), mutating the found record in place rather than replacing it, and assigning only `name`/`email` so `id` can never be overwritten by the request body. The route itself validates `name`/`email` with the same truthiness check `POST /users` already uses, checks validation before existence (so a request that's both invalid and for a missing id gets a 400, not a 404), and returns 200 with the updated user.

Before approving, I asked it to make sure the not-found path couldn't crash on a bad input — specifically that a non-numeric id like `/users/abc` wouldn't throw. It confirmed that was already covered: `Number("abc")` is `NaN`, which never matches a real id, so it falls through to the existing 404 path rather than throwing. I approved the plan as proposed after that check rather than editing it further — it already matched the codebase's existing patterns (inline validation, everything through the store) instead of introducing anything new.

## Model choice

Used the `opusplan` configuration: Opus for plan mode (the design questions — ordering of validation vs. existence checks, whether to mutate in place, whether `id` should be whitelisted), Sonnet for execution (writing the actual diffs once the plan was approved). The design decisions benefited from the extra reasoning; the implementation itself was small and mechanical enough that Sonnet handled it directly with no back-and-forth.

## Commit split

Two commits, split by layer rather than by file-touch convenience:

1. `db/store.js` — add and export `updateUser`. This is the data-access change and stands on its own.
2. `routes/users.js` — add the `PUT /:id` route that uses it. This is where the tests actually turn green.

Splitting here means each commit is independently reviewable: the first is "here's a new store operation and its contract (undefined = not found)," the second is "here's how a route consumes that contract." Neither commit leaves the app in a broken state — the store helper is inert until the route calls it.

## What review caught

I ran manual checks first — a non-numeric id (`/users/abc`), a request that's both invalid and for a missing id (confirms 400 wins, store never touched), and extra fields like `id`/`role` in the body (confirms they're silently dropped, not written). All three behaved as designed.

Then I asked Claude for an independent review of the diff cold, with no prior context on the design discussion. It traced `Number(req.params.id)` → `store.updateUser` → `getUserById` through every weird input (`"abc"`, `""`, hex, scientific notation, whitespace, negative, huge numbers) and confirmed every path degrades to a clean 404 rather than throwing. It found no bugs. It did flag one design note — `updateUser` mutates the found object in place rather than building a fresh one the way `createUser` does — which is correct today (nothing else caches a user reference) but worth knowing about if that ever changes. It also confirmed the validation gaps (whitespace-only strings, non-string values, no duplicate-email check) are pre-existing and identical to `POST /`'s current behavior, not something this change introduced — matching the plan's deliberate choice not to tighten one write route without the other. Nothing needed fixing as a result.