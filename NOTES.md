# NOTES

## Plan
Claude planned two changes: an updateUser function in db/store.js and a PUT /users/:id route in routes/users.js that returns 400 when name or email is missing or invalid and 404 when the user doesn't exist. Before approving, I edited the plan to work on a new branch and to commit in small logical commits, running npm test after each one.

## Model
I used Sonnet. The feature is small and well defined, and the tests describe exactly what it must do, so a faster, cheaper model was enough. I would pick Opus for a larger change that needs more judgement.

## Commits
Three commits, one logical change each: (1) updateUser in the store, (2) the PUT route with validation and 404, (3) the fixes from the review. Each message explains what changed without opening the diff.

## Review
Claude found no bugs; the 200, 400 and 404 cases behaved as expected, including ids like abc, -1 and 9999. It flagged that the email wasn't really validated and that values weren't trimmed. I checked both, agreed they were real, and fixed them in a separate commit. It also noted that POST validates differently; I left POST alone because it's outside the scope of this change.
