Sonnet я обрала.
Вважаю, що він чудово впорається з читанням тестів та точковим виправленням коду.

 Затверджений план:
 Plan: PUT /users/:id

What the tests need (tests/update-user.test.js):
- A va
- An unknown id (9999) with a valid body returns 404.
- A body with a field missing (name only) for id 1 returns 400.

1. db/s
  if (!user) return undefined;
  user.name = name;
  user.e
  return user;
}
- It returns undefined when the user doesn't exist, the same way getUserById does.
- It updates the object in place, so the users array stays consistent.
- Add it to module.exports.

2. routes/users.js: add PUT /:id, placed after the POST handler and matching the existing style:
// PUT /users/:id — replace a user's name and email; both are required
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.updateUser(Number(req.params.id), { name, email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
- Order of checks: validation runs first, then the lookup. A malformed request returns 400 whether or not the id exists. The tests pass either way.
- Status codes: 200 on success, 400 for missing name or email, 404 for an unknown user.
- Request body parsing: I haven't read server.js yet. POST already reads req.body, so express.json() is presumably set up. I'll confirm this when I implement.

3. Verify
- Run npm test, which runs node --test. The three new tests should pass, and users.test.js and notes.test.js should still pass.
- Run npm run lint to match the CI workflow.

Коміти розділила на два логічні кроки: спочатку шар даних у store.js, потім рівень маршрутизації в users.js, щоб підтримувати атомарність змін

Підтверджено коректність обробки відсутності полів та неіснуючих ID