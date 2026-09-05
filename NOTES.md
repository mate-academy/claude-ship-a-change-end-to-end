# Notes

**Plan.** I explored the existing route/store code first, so the plan was to match what was already there rather than invent a new style: add an `updateUser(id, { name, email })` helper to `db/store.js` that mirrors `getUserById`/`createUser` (find by id, return `undefined` if missing), then add `router.put("/:id", ...)` to `routes/users.js` reusing the exact same id-parsing (`Number(req.params.id)`), validation (`!name || !email` → 400), and not-found (`{ error: "User not found" }` → 404) patterns already used by the GET/POST routes. I didn't edit the plan before approving it — the exploration had already surfaced the conventions clearly enough that there was nothing to adjust.

**Model.** Sonnet 5. This is a small, well-scoped feature with an existing pattern to follow rather than a novel design problem, so a fast, capable model was enough — no need for deeper reasoning.

**Commits.** Two commits, one per file: first the `db/store.js` helper, then the `routes/users.js` route that calls it. Splitting them this way keeps each commit reviewable on its own (data layer vs. HTTP layer) and mirrors how the existing code is already organized.

**Review.** Self-review confirmed the new route matches the existing GET/POST conventions exactly (same error shapes, same id parsing) and that `npm test` is green with no regressions to the existing GET/POST/health tests.
