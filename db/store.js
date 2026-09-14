let users = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  { id: 2, name: "Alan Turing", email: "alan@example.com" },
];

let nextId = 3;

function getAllUsers() {
  return users;
}

function getUserById(id) {
  const numericId = Number(id);
  return users.find((user) => user.id === numericId || user.id === id);
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}

function updateUser(id, { name, email }) {
  const numericId = Number(id);
  const user = users.find((u) => u.id === numericId || u.id === id);
  if (!user) return null;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  return user;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser };