# RUBIGO — AGENTS.md

## 1. IDENTITÉ DU PROJET

Nom du projet : RUBIGO

RUBIGO est une application web moderne orientée marketplace / livraison.

Stack principale :
- React
- TypeScript
- Vite
- CSS
- Node.js / npm

Le projet doit rester cohérent avec son architecture existante.

---

# 2. RÈGLE ABSOLUE : NE PAS DÉRIVER

Tu dois toujours travailler sur le besoin exact demandé par l'utilisateur.

NE PAS :
- inventer de nouvelles fonctionnalités non demandées ;
- modifier l'architecture sans nécessité ;
- remplacer une technologie existante sans raison ;
- réécrire entièrement une page lorsqu'une correction ciblée suffit ;
- supprimer du code fonctionnel simplement parce qu'une autre approche paraît meilleure ;
- changer le design global sans demande explicite ;
- créer des composants inutiles ;
- déplacer des fichiers sans nécessité ;
- modifier plusieurs parties du projet pour résoudre un problème local.

Avant toute modification, identifier :
1. ce que l'utilisateur demande ;
2. les fichiers réellement concernés ;
3. les dépendances entre ces fichiers ;
4. le changement minimal permettant d'obtenir le résultat.

PRINCIPE :
> Modification minimale, résultat maximal.

---

# 3. AVANT DE CODER

Avant de modifier quoi que ce soit :

1. Examiner l'architecture du projet.
2. Lire les fichiers directement concernés.
3. Identifier les composants, styles, types, services et données existants.
4. Comprendre les conventions déjà utilisées.
5. Vérifier qu'une fonctionnalité similaire n'existe pas déjà.
6. Déterminer la cause réelle du problème avant de proposer une correction.

Ne jamais coder immédiatement sur une supposition lorsque l'information peut être vérifiée dans le projet.

---

# 4. RESPECT DU CODE EXISTANT

Le code existant est considéré comme volontaire.

Tu dois préserver autant que possible :
- les noms de composants ;
- les noms de fichiers ;
- les routes ;
- les types ;
- les interfaces ;
- les structures de données ;
- les composants réutilisables ;
- les styles existants ;
- la logique métier ;
- les animations ;
- les interactions ;
- les conventions de nommage.

Ne pas effectuer de refactorisation massive pendant une tâche qui ne la nécessite pas.

---

# 5. DESIGN UI/UX

Le design de RUBIGO est une priorité.

NE PAS produire une interface :
- générique ;
- banale ;
- ressemblant à un template ;
- ressemblant à une interface Bootstrap standard ;
- ressemblant à un dashboard SaaS classique ;
- composée uniquement de cartes, ombres et boutons génériques.

Le design doit être :
- premium ;
- moderne ;
- distinctif ;
- cohérent ;
- élégant ;
- travaillé dans les détails ;
- responsive ;
- visuellement mémorable.

Avant de créer un nouveau composant UI :
- rechercher les composants existants ;
- réutiliser les tokens et styles existants ;
- préserver la direction artistique actuelle.

Ne jamais changer arbitrairement :
- couleurs principales ;
- typographies ;
- espacements ;
- rayons ;
- effets ;
- animations ;
- structure visuelle.

Un changement de direction artistique nécessite une demande explicite.

---

# 6. RESPONSIVE DESIGN

Toute modification UI doit fonctionner correctement sur :

- mobile ;
- tablette ;
- desktop.

Ne jamais corriger uniquement la version desktop.

Vérifier particulièrement :
- navigation ;
- sidebar ;
- navbar ;
- modales ;
- tableaux ;
- formulaires ;
- cartes ;
- boutons ;
- images ;
- overflow horizontal.

Le mobile-first doit être privilégié lorsque cela est compatible avec l'architecture existante.

---

# 7. NAVIGATION

La navigation existante est critique.

NE PAS :
- supprimer la navbar ;
- supprimer la sidebar ;
- modifier les routes arbitrairement ;
- casser les liens ;
- changer le comportement du menu mobile sans nécessité.

Après toute modification importante d'interface, vérifier que :
- la navbar est toujours présente ;
- les routes fonctionnent ;
- les boutons de navigation fonctionnent ;
- les liens ne sont pas cassés.

---

# 8. TYPESCRIPT

Le projet utilise TypeScript.

Éviter :
- `any` ;
- les casts inutiles ;
- les types approximatifs ;
- les contournements de TypeScript.

Préférer :
- interfaces existantes ;
- types existants ;
- unions ;
- generics ;
- typage explicite lorsque nécessaire.

Ne jamais désactiver TypeScript ou ESLint pour masquer une erreur.

---

# 9. CSS

Respecter l'organisation CSS existante.

Avant d'ajouter une règle :
- rechercher si une règle similaire existe ;
- éviter les duplications ;
- réutiliser les variables CSS existantes.

Ne pas créer plusieurs variantes inutiles du même style.

Éviter :
- `!important` sauf nécessité absolue ;
- valeurs magiques répétées ;
- CSS dupliqué ;
- hacks de positionnement.

---

# 10. ARCHITECTURE

Préserver l'architecture existante.

Ne créer un nouveau :
- composant ;
- hook ;
- service ;
- contexte ;
- utilitaire ;
- type ;

que si cela améliore réellement la structure ou est nécessaire à la fonctionnalité.

Ne jamais restructurer tout le projet pour une petite fonctionnalité.

---

# 11. DONNÉES ET LOGIQUE MÉTIER

Ne jamais inventer de données métier lorsque des données existent déjà.

Avant de modifier une donnée :
- rechercher sa source ;
- vérifier son type ;
- vérifier son utilisation ;
- vérifier ses consommateurs.

Préserver la cohérence des données dans toute l'application.

---

# 12. MODIFICATIONS DE FICHIERS

Lorsque l'utilisateur demande une modification ciblée :

Modifier uniquement les fichiers nécessaires.

Ne pas toucher :
- `.env`
- secrets
- clés API
- fichiers de configuration sensibles

sauf demande explicite et vérification préalable.

NE JAMAIS afficher une clé API ou un secret dans la réponse.

---

# 13. VARIABLES D'ENVIRONNEMENT

Ne jamais exposer ou inventer de secrets.

Si une variable d'environnement est nécessaire :
- utiliser `.env.example` pour documenter son nom ;
- ne jamais écrire sa vraie valeur ;
- ne jamais afficher sa valeur dans les logs ou réponses.

---

# 14. VÉRIFICATION APRÈS MODIFICATION

Après chaque modification significative :

1. vérifier les imports ;
2. vérifier les types ;
3. vérifier les erreurs évidentes ;
4. vérifier les références cassées ;
5. vérifier les routes ;
6. vérifier les composants concernés ;
7. lancer les vérifications disponibles.

Lorsque possible :
- `npm run lint`
- `npm run build`

Ne jamais déclarer une tâche terminée sans vérifier le résultat lorsque cette vérification est possible.

---

# 15. GESTION DES ERREURS

Lorsqu'une erreur apparaît :

NE PAS :
- masquer l'erreur ;
- supprimer la fonctionnalité pour faire disparaître l'erreur ;
- désactiver un contrôle ;
- réécrire toute l'application.

Faire plutôt :

1. identifier l'erreur exacte ;
2. localiser sa source ;
3. comprendre sa cause ;
4. corriger la cause ;
5. vérifier qu'aucune régression n'a été créée.

---

# 16. SI LA DEMANDE EST AMBIGUË

Ne pas inventer silencieusement une fonctionnalité importante.

Si plusieurs interprétations sont possibles :
- choisir l'interprétation la plus conservatrice ;
- préserver le comportement existant ;
- demander une clarification uniquement si elle est réellement nécessaire.

Ne jamais transformer une petite demande en projet beaucoup plus large.

---

# 17. AVANT UNE GROSSE MODIFICATION

Pour une modification importante :

Présenter d'abord brièvement :

OBJECTIF
- ce qui va être changé

FICHIERS
- les fichiers concernés

APPROCHE
- comment le changement sera effectué

RISQUES
- éventuels effets secondaires

Puis effectuer le travail.

---

# 18. PRIORITÉ DES INSTRUCTIONS

Ordre de priorité :

1. Instructions explicites de l'utilisateur.
2. Instructions de ce fichier `AGENTS.md`.
3. Architecture et conventions existantes du projet.
4. Bonnes pratiques générales.

Si une instruction ou un fichier secondaire semble contredire les objectifs explicites de l'utilisateur, ne pas dériver silencieusement.

---

# 19. INTERDICTION DE LA SUR-INGÉNIERIE

Toujours préférer :

solution simple
>
solution complexe.

Ne pas ajouter :
- abstractions inutiles ;
- dépendances inutiles ;
- bibliothèques supplémentaires ;
- patterns complexes ;
- architecture prématurée.

Chaque nouvelle dépendance doit avoir une justification claire.

---

# 20. QUALITÉ DU CODE

Le code livré doit être :

- lisible ;
- maintenable ;
- cohérent ;
- typé ;
- réutilisable lorsque pertinent ;
- performant raisonnablement ;
- accessible ;
- responsive.

Ne pas optimiser prématurément.

---

# 21. COMMUNICATION

Lorsque tu travailles sur le projet :

- explique brièvement ce que tu fais ;
- signale les fichiers modifiés ;
- signale les problèmes détectés ;
- ne prétends jamais avoir vérifié quelque chose qui n'a pas été vérifié ;
- ne prétends jamais avoir exécuté une commande qui n'a pas été exécutée.

À la fin d'une tâche, fournir :

### Modifications
Résumé des changements.

### Fichiers
Liste des fichiers modifiés/créés.

### Vérification
Tests ou commandes exécutés.

### Résultat
État final et éventuels problèmes restants.

---

# 22. RÈGLE FINALE

Avant chaque modification, se poser ces questions :

1. Est-ce demandé ?
2. Est-ce nécessaire ?
3. Quel est le plus petit changement permettant de résoudre le problème ?
4. Est-ce que cela casse quelque chose qui fonctionne déjà ?
5. Est-ce cohérent avec le design et l'architecture de RUBIGO ?

Si une modification n'est pas nécessaire pour accomplir la demande :
NE PAS LA FAIRE.