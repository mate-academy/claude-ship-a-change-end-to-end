# NOTES

## Plan

I did not edit the plan proposed by claude before approval


## Model
The endpoint was implemented with Claude Sonnet 5.5. This is a small, well-specified change with tests that define "done", so a fast mid-tier model is enough. A larger model would add cost without changing the result.

## Commits
I implemented that commit split to keep commits clear and handle one task per commit:

1. Add `updateUser` to `db/store.js` (data layer).
2. Add `PUT /users/:id` with validation and 404 handling in `routes/users.js`.
3. Add `CLAUDE.md` and `NOTES.md` (docs).
   

## Review
Found issues by Claude:  
- PUT and POST validate differently. 
- PUT rejects non-strings and blank values and trims them. POST only checks truthiness, so {name: 123} is accepted by POST but rejected by PUT. 