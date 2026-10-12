// Extra edge-case tests for PUT /users/:id (the provided update-user tests stay untouched).

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

const valid = { name: "Edge Case", email: "edge@example.com" };

test("PUT /users/:id rejects whitespace-only and non-string fields with 400", async () => {
  const created = await request(app).post("/users").send({ name: "Temp", email: "temp@example.com" });
  const url = `/users/${created.body.id}`;

  for (const body of [
    { name: "   ", email: "a@example.com" },
    { name: "Ok", email: "" },
    { name: 123, email: "a@example.com" },
    { name: "Ok", email: {} },
  ]) {
    const res = await request(app).put(url).send(body);
    assert.strictEqual(res.status, 400);
  }
});

test("PUT /users/:id trims name and email", async () => {
  const created = await request(app).post("/users").send({ name: "Temp", email: "temp@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: "  Trimmed  ", email: "  trimmed@example.com " });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Trimmed");
  assert.strictEqual(res.body.email, "trimmed@example.com");
});

test("PUT /users/:id returns 404 for ids that are not plain integers", async () => {
  for (const id of ["abc", "1.5", "1.0", "1e0", "0x1", "-1", "%201"]) {
    const res = await request(app).put(`/users/${id}`).send(valid);
    assert.strictEqual(res.status, 404, `id "${id}" should be 404`);
  }
});

test("PUT /users/:id with an unknown id is 404 even when the body is invalid", async () => {
  const res = await request(app).put("/users/abc").send({});
  assert.strictEqual(res.status, 404);
});
