const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

for (const email of ["@", "a@", "@b.com", "a@b", "a b@c.com", "a@@b.com", "user@.example.com", "user@example..com", "user@example.com."]) {
  test(`PUT /users/:id rejects the malformed email "${email}" with 400`, async () => {
    const res = await request(app).put("/users/1").send({ name: "Ada", email });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(typeof res.body.error, "string");

    const after = await request(app).get("/users/1");
    assert.notStrictEqual(after.body.email, email.trim());
  });
}

test("PUT /users/:id accepts a normal email, trimmed", async () => {
  const res = await request(app)
    .put("/users/2")
    .send({ name: "Alan Turing", email: "  alan.turing@example.co.uk " });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.email, "alan.turing@example.co.uk");
});

test("PUT /users/:id rejects a whitespace-only name with 400", async () => {
  const res = await request(app).put("/users/1").send({ name: "   ", email: "ada@example.com" });

  assert.strictEqual(res.status, 400);
});
