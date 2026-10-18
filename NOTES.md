\# Notes



\## Plan

I added a PUT /users/:id endpoint to update an existing user.

The route validates that name and email are present, returns 400 if missing,

and returns 404 if the user does not exist. I added an updateUser function

in db/store.js that finds the user by id and updates its name and email.



\## Commits

\- Added updateUser to db/store.js and exported it.

\- Added PUT /users/:id route in routes/users.js.



\## Review

I verified the change by running `npm test`. The route follows the same

style as the existing GET and POST routes, reuses store.getUserById for

the 404 check, and returns the updated user as JSON.

