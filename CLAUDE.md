# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Common commands:**
- `npm run dev` — Run server with file-watching during development
- `npm start` — Run the server once
- `npm test` — Run all tests (Node.js built-in test runner)
- `npm run lint` — Run ESLint

**Run a single test:**
```
node --test tests/update-user.test.js
```

## Architecture

This is a small Express API (starter template for course projects) with three layers:

**1. Server (`server.js`)**
- Creates Express app, registers middleware (JSON parsing), mounts route handlers
- Exports `app` so tests can import it; only starts listening when run directly

**2. Routes (`routes/`)**
- `routes/users.js` — User resource: GET /users (list), GET /users/:id (fetch), POST /users (create), PUT /users/:id (update — to be implemented)
- `routes/health.js` — Health check endpoint
- Each route validates input (return 400 for missing fields) and handles missing resources (return 404)

**3. Data Store (`db/store.js`)**
- In-memory data store (not persisted; resets on restart)
- All data access goes through the store module
- Exports: `getAllUsers()`, `getUserById(id)`, `createUser({ name, email })`, and `updateUser(id, { name, email })` (to be implemented)

## Current Project: Implement PUT /users/:id

**What to build:**
- Add a `PUT /users/:id` endpoint to update an existing user
- Validate that both `name` and `email` are provided in the request body (return 400 if missing)
- Return 404 if the user doesn't exist
- Return 200 with the updated user object on success
- Follow the existing pattern: route handler calls a store function

**Tests:** `tests/update-user.test.js` defines the requirements. Run tests as you build; they'll turn green when the endpoint is correct.

**Related files to touch:**
- `routes/users.js` — Add the PUT route handler
- `db/store.js` — Add the `updateUser(id, { name, email })` function (update the user in-place, return the updated user)

## Testing

- Tests use Node.js built-in `test` module (no external test framework)
- `supertest` for HTTP request/response assertions
- Tests import `app` from `server.js`, so server doesn't start listening during test runs
- Each test file runs independently

## Code Style

- ESLint rules in `.eslintrc.json` — unused parameters matching `_`, `req`, `res`, `next` are OK
- No strict linting — warnings are fine, aim to avoid errors

## Environment

- `.env.example` shows the shape of environment config
- PORT defaults to 3000 if not set
- Create `.env` from `.env.example` to override defaults locally
