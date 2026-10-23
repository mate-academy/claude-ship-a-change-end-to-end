## Plan
The Update a User plan feature added includes:
- PUT /users/:id to replace user's name and email, it validates and input with clear per field errors, returning 404 for unknown user instead of crashing and goes through db/store.js like other routes.
- Validation of the request body to avoid crashing and corrupt data.
- The plan includes staggered commits by clear changes added.

I also added an instruction to include meaningful error messages.


## Model choice 
I decided to use Opus to plan and execute as I wanted to be thorough with the planning and careful with the execution.

## Commit split

Commit 1: db/store.js, add the updateUser helper
Commit 2: routes/users.js, add PUT /:id with validation and the 404
Add a small validator at module level and the handler after GET /:id:
 Commit 3 (only if needed): fixes from the review
 Commit 4: NOTES.md

## Review caught

- #2 Untrimmed values are stored. 
- #8 Too-large bodies still get the HTML error page. Bodies over 100kb hit the same default page as malformed JSON did.
- #9 No tests for the new validation.