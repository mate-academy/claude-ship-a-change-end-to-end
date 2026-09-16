# NOTES.md

## Plan
Plan the new endpoint "update a user" to 

- update an existing user by id (PUT /users/:id)
- validate the input, rejecting missing or invalid fields with a clear error
- return a sensible "not found" response when the user doesn't exist, rather than crashing
- go through db/store.js for data access, following the existing pattern

The repo already contains the tests for this endpoint, in tests/update-user.test.js. They start red — making them pass is how 


## Tasks

[ ] Add the updateUser function to db/store.js
[ ] Add the PUT /users/:id route to routes/users.js
[ ] Add input validation (return 400 for missing fields)
[ ] Add 404 handling for non-existent users

## Commits
First commit contains changes to db/store.js
Second commit contains the creation of the new endpoint (+ input validation, 400 and 404 return responses)

## Model
I will use opusplan
