# Notes

## Le plan approuvé

Ajouter `PUT /users/:id` en trois temps : un helper `updateUser(id, { name, email })`
dans `db/store.js`, la route correspondante dans `routes/users.js`, puis ce
`NOTES.md`. La route valide la présence de `name` et `email` (400 sinon), puis
délègue au store qui renvoie `undefined` quand l'id est inconnu (404 sinon).
Je n'ai rien retouché au plan avant approbation. Deux points écartés
volontairement : la validation du format d'email (le POST existant ne la fait
pas non plus, on garde la parité) et le support de `PATCH` / mise à jour
partielle (hors périmètre des tests).

## Choix du modèle

Claude Sonnet 5 : la fonctionnalité est petite et entièrement cadrée par les
tests de correction, donc pas besoin d'un modèle plus lourd. Sonnet suit bien
les patterns existants du repo et reste rapide sur ce type de changement.

## Découpage des commits

Trois commits, un changement logique chacun : (1) le helper du store, (2) la
route HTTP qui s'appuie dessus, (3) ce write-up. Le store et la route sont
séparés parce qu'ils sont testables et relisibles indépendamment, et l'ordre
suit la dépendance (la route importe le helper).

## Ce que la revue a confirmé

L'ordre validation → not-found ne casse aucun test : le test 404 envoie un
corps valide, le test 400 vise un id existant. `Number(req.params.id)` est
cohérent avec `GET /:id`. `npm run lint` et `npm test` passent (les 3 tests
`update-user` verts, aucune régression sur `users.test.js`).

---

# MES NOTES

## Le plan approuvé, et mes retouches avant validation

Le plan tenait en trois étapes : ajouter un helper `updateUser(id, { name, email })`
dans `db/store.js`, brancher la route `PUT /users/:id` dans `routes/users.js`
(validation de la présence de `name` et `email` → 400, sinon délégation au store
qui renvoie `undefined` si l'id est inconnu → 404, sinon 200 + utilisateur mis à
jour), puis écrire ce `NOTES.md`. Je n'ai rien modifié avant d'approuver : le
périmètre était entièrement cadré par `tests/update-user.test.js`. J'ai en
revanche acté deux exclusions volontaires dans le plan — pas de validation du
format d'email (le `POST` existant ne le fait pas non plus, on garde la parité)
et pas de `PATCH` / mise à jour partielle (hors sujet des tests).

## Le modèle choisi, et pourquoi

Claude Sonnet 5. La fonctionnalité est petite et sans ambiguïté, avec des tests
qui servent de spécification ; un modèle plus lourd n'apportait rien. Sonnet
reprend fidèlement les conventions déjà en place dans le repo
(`Number(req.params.id)`, forme des messages d'erreur) et reste rapide sur ce
type de changement.

## Le découpage des commits, et pourquoi ainsi

Un changement logique par commit : (1) le helper du store, (2) la route HTTP qui
s'appuie dessus, (3) ce document, (4) le correctif de validation d'id issu de la
revue. Store et route sont séparés parce qu'ils se relisent et se testent
indépendamment, et l'ordre suit la dépendance (la route importe le helper). Le
correctif de réutilisation de `getUserById` a été intégré directement au commit
du helper, pour ne pas laisser un commit « fix revue » parasite dans un
historique non encore poussé.

## Ce que la revue a relevé — ou confirmé comme correct

La revue a confirmé le cœur : ordre validation → 404 sans conflit avec les
tests, cohérence avec les handlers `GET`/`POST` existants, `npm test` et
`npm run lint` au vert. Elle a soulevé trois points mineurs, dont deux corrigés.
D'abord, `updateUser` refaisait à la main la recherche par id : elle réutilise
maintenant `getUserById` pour éviter que les deux copies divergent. Ensuite,
`PUT /users/abc` renvoyait 404 (l'id `NaN` ne correspond à personne) alors qu'il
s'agit d'une requête malformée : la route rejette désormais un id non entier
avec un 400 explicite. Le troisième point est laissé volontairement : le bloc de
validation `name`/`email` est dupliqué depuis le `POST`, mais un helper partagé
serait prématuré pour deux occurrences.
