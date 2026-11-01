const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("malformed JSON body returns a JSON 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .set("Content-Type", "application/json")
    .send("{bad");

  assert.strictEqual(res.status, 400);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.strictEqual(res.body.error, "Malformed request");
});

test("malformed URL encoding returns a JSON 400", async () => {
  const res = await request(app).get("/users/%");

  assert.strictEqual(res.status, 400);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.strictEqual(res.body.error, "Malformed request");
});

test("an oversized JSON body returns a JSON 413", async () => {
  const res = await request(app)
    .post("/users")
    .set("Content-Type", "application/json")
    .send(JSON.stringify({ name: "x".repeat(200 * 1024), email: "a@b.co" }));

  assert.strictEqual(res.status, 413);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.ok(res.body.error);
});

test("an unknown route still returns Express's 404", async () => {
  const res = await request(app).get("/nope");
  assert.strictEqual(res.status, 404);
});
