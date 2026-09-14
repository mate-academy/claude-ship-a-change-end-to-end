# Notes

## What was in the plan, and did you edit anything before approving?

The plan was to follow existing patterns and make 2 changes: one to look up the
user and mutate it with the new name and email, reusing the existing
functions, and secondly to validate the input. I updated the plan to clarify
that it needs to run tests after each commit and to break the commits down
logically.

## Which model, and why?

Plan mode, then switched to Sonnet. This wasn't a heavy feature, so that
seemed like the right choice given there were existing patterns in the
codebase to follow.

## How did you split your commits, and why that way?

Commits were split how Claude suggested, based on asking it to do logical
ones: the first was adding the lookup/update helper and the route to find and
update the user, and the second was handling validation.

## What did your review catch, or confirm was already fine?

The review caught an issue with whitespace not being trimmed on save, and
that PUT's validation was stricter than POST's. It also flagged 3 judgement
calls: that 400 was taking precedence over 404, that email validation
accepted any string rather than requiring an email format, and that id
parsing was duplicated between routes. It said the main logic and the general
feature were fine.
