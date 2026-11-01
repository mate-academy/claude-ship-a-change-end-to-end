const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");
const validateId = require("../middleware/validateId");
const { requireUserId } = validateId;
const config = require("../config");

// Run the middleware against a stub request and report what it did.
function run(middleware, { method, raw, path = "/:id", baseUrl = "/users" }) {
  const req = { method, baseUrl, route: { path } };
  const outcome = { next: false, status: null, body: null, req };
  const res = {
    status(code) {
      outcome.status = code;
      return this;
    },
    json(body) {
      outcome.body = body;
    },
  };
  middleware(req, res, () => {
    outcome.next = true;
  }, raw);
  return outcome;
}

const endpoints = { GET: { "/users/:id": true }, PUT: { "/users/:id": false } };
const mw = validateId(endpoints);

test("validateId parses a valid id onto req.userId for a listed route", () => {
  const out = run(mw, { method: "GET", raw: "5" });
  assert.strictEqual(out.next, true);
  assert.strictEqual(out.req.userId, 5);
});

test("validateId rejects a malformed id with a 400", () => {
  const out = run(mw, { method: "GET", raw: "abc" });
  assert.strictEqual(out.next, false);
  assert.strictEqual(out.status, 400);
  assert.match(out.body.error, /positive integer/);
});

test("validateId rejects an id above maxUserId as out of range", () => {
  const out = run(mw, { method: "GET", raw: String(config.maxUserId + 1) });
  assert.strictEqual(out.status, 400);
  assert.strictEqual(out.body.error, "id is out of range");
  assert.strictEqual(run(mw, { method: "GET", raw: "99999999999999999999" }).body.error, "id is out of range");
});

test("validateId accepts the largest allowed id", () => {
  const out = run(mw, { method: "GET", raw: String(config.maxUserId) });
  assert.strictEqual(out.req.userId, config.maxUserId);
});

test("validateId skips unlisted methods, routes and routes set to false", () => {
  const cases = [
    { method: "DELETE", raw: "abc" },
    { method: "PUT", raw: "abc" }, // listed but false
    { method: "GET", raw: "abc", path: "/:other" },
    { method: "GET", raw: "abc", baseUrl: "/other" },
  ];
  for (const c of cases) {
    const out = run(mw, c);
    assert.strictEqual(out.next, true, JSON.stringify(c));
    assert.strictEqual(out.status, null);
    assert.strictEqual(out.req.userId, undefined);
  }
});

test("validateId is not fooled by inherited object keys", () => {
  for (const c of [
    { method: "constructor", raw: "abc" },
    { method: "toString", raw: "abc" },
    { method: "GET", raw: "abc", baseUrl: "", path: "__proto__" },
    { method: "GET", raw: "abc", baseUrl: "", path: "constructor" },
  ]) {
    const out = run(mw, c);
    assert.strictEqual(out.next, true, JSON.stringify(c));
    assert.strictEqual(out.status, null);
  }
});

test("validateId treats HEAD like GET", () => {
  assert.strictEqual(run(mw, { method: "HEAD", raw: "7" }).req.userId, 7);
  assert.strictEqual(run(mw, { method: "HEAD", raw: "abc" }).status, 400);
});

test("HEAD /users/:id behaves like GET /users/:id", async () => {
  const head = await request(app).head("/users/1");
  assert.strictEqual(head.status, 200);

  const missing = await request(app).head("/users/9999");
  assert.strictEqual(missing.status, 404);

  const bad = await request(app).head("/users/abc");
  assert.strictEqual(bad.status, 400);
});

test("GET and PUT /users/:id share the same id validation", async () => {
  const body = { name: "Edge Case", email: "edge@example.com" };
  const cases = [
    ["abc", 400, /positive integer/],
    ["0", 400, /positive integer/],
    ["01", 400, /positive integer/],
    ["1e2", 400, /positive integer/],
    [String(config.maxUserId + 1), 400, /out of range/],
    ["99999999999999999999", 400, /out of range/],
    ["9999", 404, /not found/i],
  ];
  for (const [id, status, message] of cases) {
    const get = await request(app).get(`/users/${id}`);
    const put = await request(app).put(`/users/${id}`).send(body);
    assert.strictEqual(get.status, status, `GET ${id}`);
    assert.strictEqual(put.status, status, `PUT ${id}`);
    assert.match(get.body.error, message);
    assert.match(put.body.error, message);
  }
});

test("an encoded id is decoded before validation", async () => {
  const res = await request(app).get("/users/%31");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, 1);
});

test("requireUserId passes when the id was validated", () => {
  let error = "unset";
  requireUserId({ userId: 3 }, {}, (err) => {
    error = err;
  });
  assert.strictEqual(error, undefined);
});

test("requireUserId fails loudly when an :id route was never configured", () => {
  let error;
  const req = { method: "DELETE", baseUrl: "/users", route: { path: "/:id" } };
  requireUserId(req, {}, (err) => {
    error = err;
  });
  assert.ok(error instanceof Error);
  assert.match(error.message, /DELETE \/users\/:id/);
  assert.match(error.message, /idValidatedEndpoints/);
});
