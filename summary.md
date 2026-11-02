# Project file summary

- `.claude/settings.local.json` — local Claude Code settings for this project.
- `.env.example` — sample environment configuration (PORT, example DATABASE_URL).
- `.eslintrc.json` — ESLint config (eslint:recommended, Node/ES2022).
- `.github/workflows/ci.yml` — GitHub Actions CI workflow running on push and pull request.
- `.gitignore` — files and folders excluded from git.
- `.mcp.json` — MCP config registering the filesystem server for this folder.
- `NOTES.md` — write-up of project decisions, plan, and model choice.
- `README.md` — course project description and the files to touch.
- `db/store.js` — in-memory user data store and its helper functions.
- `package.json` — npm manifest with scripts (dev, start, test, lint) and dependencies.
- `package-lock.json` — locked dependency versions.
- `routes/health.js` — `GET /health` liveness check route.
- `routes/users.js` — users resource routes (list, get, create, update).
- `server.js` — Express app setup that mounts routes and starts the server.
- `tests/notes.test.js` — grading test checking that NOTES.md exists with real content.
- `tests/update-user.test.js` — tests for the `PUT /users/:id` endpoint.
- `tests/users.test.js` — tests for the health and users endpoints.
- `node_modules/` — installed npm dependencies (generated).
