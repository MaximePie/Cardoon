# Tests Backend

## Installation

Les dépendances de test sont installées automatiquement avec :

```bash
yarn install
```

## Dépendances de test

- **Jest** : Framework de test
- **ts-jest** : Support TypeScript pour Jest
- **Supertest** : Test des endpoints API
- **MongoDB Memory Server** : Base de données MongoDB en mémoire pour les tests

## Exécution des tests

### Tests unitaires et d'intégration

```bash
yarn test
```

### Tests en mode watch (développement)

```bash
yarn test:watch
```

### Tests avec couverture de code

```bash
yarn test:coverage
```

### Tests pour CI/CD

```bash
yarn test:ci
```

## Structure des tests

```
server/
├── src/
│   ├── __tests__/          # Tests d'intégration
│   │   └── integration.test.ts
│   └── utils/
│       ├── numberUtils.ts
│       └── numberUtils.test.ts  # Tests unitaires
├── jest.config.js          # Configuration Jest
└── tsconfig.test.json      # Configuration TypeScript pour les tests
```

## Configuration Jest

Le fichier `jest.config.js` configure Jest pour :

- Utiliser ts-jest pour le support TypeScript
- Exécuter les tests dans un environnement Node.js
- Collecter la couverture de code
- Gérer les imports avec extension `.js` (CommonJS)

## Tests d'intégration

Les tests d'intégration utilisent :

- **Supertest** pour tester les endpoints HTTP
- **MongoDB Memory Server** pour une base de données en mémoire
- Configuration automatique avant/après les tests

## CI/CD

Les tests sont intégrés dans GitHub Actions (`.github/workflows/ci.yml`) :

- Exécution automatique sur les pull requests et push
- Upload des rapports de couverture vers Codecov
- Vérification du build TypeScript
- Tests en parallèle avec le frontend
