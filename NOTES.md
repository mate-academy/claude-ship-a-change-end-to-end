# Notes

**The plan.** Add `PUT /users/:id`, following the exact pattern already used by `GET /users/:id`
and `POST /users`: validate `name`/`email` in the route handler (400 on a missing field),
delegate the actual mutation to a new `updateUser` helper in `db/store.js`, and return 404 when
`updateUser` finds no matching user. I approved the plan as drafted — nothing needed editing,
since the target behavior was already fully pinned down by the pre-written
`tests/update-user.test.js`.

**Model.** Claude Sonnet 5. The task was small and fully specified by existing tests and an
existing code pattern to mirror, so a fast general-purpose model was enough — there was no
ambiguous design space that would have benefited from a slower, deeper-reasoning model.

**Commits.** Two: (1) the endpoint itself — the `updateUser` store helper and the `PUT /:id`
route together, since neither is meaningful on its own and this is the single change that turns
the given tests green; (2) this `NOTES.md`, added last once there was real content (plan, model,
commits, review) to write about.

**Review.** Self-review (line-by-line correctness, removed-behavior, cross-file callers,
language pitfalls, reuse/simplification, and CLAUDE.md conventions) found no bugs. It confirmed
the validation order matches the existing `POST /users` handler, the error response shapes match
the existing `GET`/`POST` handlers, a non-numeric `:id` falls through to 404 the same way
`GET /users/:id` already does (no new edge case introduced), and the change reuses
`getUserById` rather than duplicating lookup logic.
