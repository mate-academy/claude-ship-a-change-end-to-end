// Extra edge cases for PUT /users/:id, beyond the provided grading tests in
// update-user.test.js. Each test creates its own user so seeded data is untouched.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

async function createUser() {
  const res = await request(app)
    .post("/users")
    .send({ name: "Edge Case", email: "edge@example.com" });
  return res.body;
}

test("PUT /users/:id persists the update and keeps the id", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ id: 12345, name: "  Trimmed Name  ", email: " trimmed@example.com " });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, {
    id: user.id,
    name: "Trimmed Name",
    email: "trimmed@example.com",
  });

  const fetched = await request(app).get(`/users/${user.id}`);
  assert.deepStrictEqual(fetched.body, res.body);
});

test("PUT /users/:id rejects invalid fields with a JSON error", async () => {
  const user = await createUser();
  const invalidBodies = [
    {},
    { email: "only@example.com" },
    { name: "   ", email: "a@example.com" },
    { name: 42, email: "a@example.com" },
    { name: "Valid", email: "not-an-email" },
  ];

  for (const body of invalidBodies) {
    const res = await request(app).put(`/users/${user.id}`).send(body);
    assert.strictEqual(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
    assert.strictEqual(typeof res.body.error, "string");
  }

  const unchanged = await request(app).get(`/users/${user.id}`);
  assert.strictEqual(unchanged.body.name, "Edge Case");
});

test("PUT /users/:id returns a JSON 404 for a non-numeric id", async () => {
  const res = await request(app)
    .put("/users/abc")
    .send({ name: "Nobody", email: "nobody@example.com" });

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "User not found" });
});
