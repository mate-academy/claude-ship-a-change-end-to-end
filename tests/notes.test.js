// Grading test: every submission must include a NOTES.md write-up.
// This checks that you wrote one with real content — it can't judge how good
// it is, so keep it honest: your plan, model choice, commit split, and review.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const NOTES = path.join(__dirname, "..", "NOTES.md");

test("NOTES.md exists at the project root", () => {
  assert.ok(
    fs.existsSync(NOTES),
    "Add a NOTES.md explaining your plan, model choice, commit split, and what your review caught.",
  );
});

test("NOTES.md has real content", () => {
  const text = fs.existsSync(NOTES) ? fs.readFileSync(NOTES, "utf8").trim() : "";
  assert.ok(
    text.length >= 80,
    "NOTES.md looks empty — write a few sentences on your plan, model, commits, and review.",
  );
});
