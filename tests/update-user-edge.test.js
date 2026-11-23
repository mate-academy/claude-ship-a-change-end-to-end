// Extra edge cases found in review for PUT /users/:id (the graded file stays untouched).
const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("PUT /users/:id with a non-numeric id returns 404, not a crash", async () => {
  const res = await request(app).put("/users/abc").send({ name: "X", email: "x@example.com" });
  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id rejects blank or non-string fields with 400", async () => {
  const blank = await request(app).put("/users/2").send({ name: "   ", email: "alan@example.com" });
  assert.strictEqual(blank.status, 400);
  const notString = await request(app).put("/users/2").send({ name: "Alan", email: 42 });
  assert.strictEqual(notString.status, 400);
});

test("PUT /users/:id rejects an email without @ and leaves the user unchanged", async () => {
  const res = await request(app).put("/users/2").send({ name: "Alan", email: "not-an-email" });
  assert.strictEqual(res.status, 400);
  const after = await request(app).get("/users/2");
  assert.strictEqual(after.body.email, "alan@example.com");
});

test("PUT /users/:id trims name and email", async () => {
  const res = await request(app).put("/users/2").send({ name: "  Alan M. Turing ", email: " alan.turing@example.com " });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Alan M. Turing");
  assert.strictEqual(res.body.email, "alan.turing@example.com");
});
