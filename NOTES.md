# NOTES

## Le plan approuvé

Ajouter `PUT /users/:id` en deux couches : une fonction `updateUser` dans `db/store.js` (les routes ne touchent jamais aux données directement), puis la route dans `routes/users.js` (conversion de l'id en nombre, validation, 404 si l'utilisateur n'existe pas, 200 avec l'utilisateur modifié sinon).

J'ai modifié le plan sur un point : j'ai demandé que les champs soient **validés avant** de chercher l'utilisateur. Une requête avec un champ manquant reçoit donc toujours 400, même si l'id n'existe pas.

## Le modèle choisi

`opusplan` : Opus pour planifier, Sonnet pour écrire le code. Le plan est la partie qui demande le plus de réflexion (quels fichiers, quels cas limites) ; écrire une petite route est plus simple et Sonnet suffit.

## Le découpage des commits

Un changement logique par commit :
1. `updateUser` dans le store (la logique de données, sans route).
2. La route `PUT /users/:id` (400, 404, 200).
3. Le rejet des champs qui ne sont pas du texte, trouvé pendant la revue : séparé pour que la correction se lise seule.
4. Ce fichier `NOTES.md`.

## Ce que la revue a trouvé

- **Un vrai problème :** `name: 123` ou `name: { a: 1 }` était accepté (200) et enregistré, car la validation ne testait que les valeurs absentes. Corrigé : 400 si `name` ou `email` n'est pas une chaîne.
- **Déjà correct :** un id absurde comme `abc` donne 404 sans planter, un corps vide donne 400, et la modification est bien conservée (un `GET` ensuite renvoie la nouvelle valeur).
- **Non traité volontairement :** `POST /users` a la même faiblesse (il accepte un nombre comme nom). Je ne l'ai pas modifié pour garder la PR centrée sur la mise à jour.
- **À savoir :** le test « 404 » passait déjà avant d'écrire la route, parce qu'Express répond 404 pour une route qui n'existe pas. Il ne prouvait rien tant que la route n'était pas écrite.
