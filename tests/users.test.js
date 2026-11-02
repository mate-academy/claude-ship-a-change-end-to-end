const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, "ok");
});

test("GET /users returns a list of users", async () => {
  const res = await request(app).get("/users");
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test("GET /users/:id returns 404 for a user that does not exist", async () => {
  const res = await request(app).get("/users/9999");
  assert.strictEqual(res.status, 404);
});

test("POST /users with no body returns 400", async () => {
  const res = await request(app).post("/users").send({});
  assert.strictEqual(res.status, 400);
});

const validBody = { name: "Grace Hopper", email: "grace@example.com" };

test("PUT /users/:id rejects non-string fields with 400", async () => {
  const res = await request(app).put("/users/1").send({ name: 123, email: "a@b.co" });
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /strings/);
});

test("PUT /users/:id rejects whitespace-only fields with 400", async () => {
  const res = await request(app).put("/users/1").send({ name: "   ", email: "a@b.co" });
  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id rejects an invalid email with 400", async () => {
  for (const email of ["nope", "@", "a@", "a b@c.co"]) {
    const res = await request(app).put("/users/1").send({ name: "A", email });
    assert.strictEqual(res.status, 400, `email ${email}`);
    assert.strictEqual(res.body.error, "email is invalid");
  }
});

test("PUT /users/:id with an empty body returns 400", async () => {
  const res = await request(app).put("/users/1");
  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id returns 404 for non-numeric or odd ids", async () => {
  for (const id of ["abc", "1e0", "0x1", "1.5"]) {
    const res = await request(app).put(`/users/${id}`).send(validBody);
    assert.strictEqual(res.status, 404, `id ${id}`);
    assert.strictEqual(res.body.error, "User not found");
  }
});

test("PUT /users/:id trims values and ignores an id in the body", async () => {
  const res = await request(app)
    .put("/users/2")
    .send({ id: 99, name: "  Alan T  ", email: " alan@example.com " });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, 2);
  assert.strictEqual(res.body.name, "Alan T");
  assert.strictEqual(res.body.email, "alan@example.com");
});
