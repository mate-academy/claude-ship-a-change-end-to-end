# NOTES

## The plan

I planned this in Claude Code's plan mode before writing any code. The plan was to add `store.updateUser(id, { name, email })` to `db/store.js` following the existing `getUserById`/`createUser` style, then add a `PUT /:id` handler in `routes/users.js` that validates `name`/`email` are present (400, matching `POST /users`'s validation), looks up the user via the store (404 if missing, matching `GET /users/:id`), and returns the updated user (200) otherwise. I approved the plan as written — no edits were needed, since the two existing routes already gave clear patterns to follow for validation and not-found handling.

## Model choice

I used Claude Sonnet 5 for the whole task — planning, implementation, and review. The change was small and the codebase tiny (a two-route Express resource with no ambiguity in requirements), so there was no need for a heavier model; Sonnet 5 handled reading the existing patterns and applying them consistently without issue.

## Commit split

Two commits: the first adds the `updateUser` store function and the `PUT /:id` route together, since they're one indivisible logical change — the endpoint doesn't work without the store function, and the store function has no other caller. The second commit is a small follow-up from self-review (see below), kept separate so the "what review caught" fix is visible on its own rather than folded into the original diff.

## What review caught

I ran a self-review of the diff before opening the PR. It flagged one real issue: `updateUser` reimplemented the same `users.find((user) => user.id === id)` lookup that `getUserById` already does, instead of calling it. Not a correctness bug, but a duplication that would let the two lookups silently drift if the storage strategy ever changed. I fixed it by having `updateUser` call `getUserById(id)` directly. The review otherwise confirmed the validation order, the not-found path, and the in-place mutation of the found user were all consistent with the rest of the resource and had no regressions.
