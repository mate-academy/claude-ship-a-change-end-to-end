# Notes: Update User Endpoint 
## Plan 
Ran npm test to see what was failing, then had Claude add a PUT /users/:id route and an updateUser helper. 
Reviewed the changes, then wrote these notes. 
## Model choice 
Sonnet 5.5 was the default, and I kept it because this was a small, well-defined change, and the tests spelled out exactly what “done” looked like. A faster, lighter model was enough. I’d switch to Opus for bigger or less clear tasks.
## Commit split 
One commit for the endpoint code, one for NOTES.md.
## What my review caught
The new PUT route checks for a missing name or email (400) before looking up the user (404), so bad requests never touch the data. I also noticed PUT requires both fields, so you can't update just one.
