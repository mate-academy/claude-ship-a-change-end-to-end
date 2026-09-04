# Notes

## Plan

The approved plan covered three changes: add `updateUser` to `db/store.js` reusing the existing `getUserById` lookup, add a `PUT /:id` route to `routes/users.js` combining the existing validation and 404 patterns, and create this write-up. The plan was rejected once on first submission — I asked Claude to explain how the not-found and invalid-input cases were handled before I was satisfied — then approved without edits.

## Model

Claude Sonnet 4.6, the default in Claude Code. For a task this size — one new endpoint across two files — Sonnet is fast enough to hold the whole codebase and the review findings in a single session, and there was no reasoning complexity that would justify reaching for Opus.

## Commit split

Five commits in total. The first three follow the natural implementation order: store helper, then route (tests go green here), then NOTES.md. Two more commits came after the first code review: one to remove a dead store-level throw, one to harden body parsing in PUT and POST. Keeping the review fixes separate makes it clear in the log where the feature became correct and where it became robust.

## What review caught

Two rounds of review ran. The first caught four issues: `req.body` crashes with a TypeError when `Content-Type` is absent (express.json() skips parsing and leaves `req.body` undefined); a non-numeric id like `/users/abc` returning a misleading 404 instead of 400 because `Number("abc")` is NaN; whitespace-only strings like `"   "` passing the falsy `!name` check and being stored verbatim; and `updateUser` returning a direct reference to the live store object, letting callers silently mutate stored records. The second round reviewed the fixes themselves and caught two more: `null` and non-string body fields (e.g. `{ name: null }` or `{ name: 123 }`) bypassing the empty-string defaults and crashing on `.trim()`; and the store-level validation throw being both unreachable via the route and semantically inconsistent with the route's `.trim()` check. The 200 success path and the 404 not-found path were correct from the start.
