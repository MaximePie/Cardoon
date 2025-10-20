# 🐕 Husky Configuration

Ce projet utilise **Husky** pour automatiser la qualité du code via des Git hooks.

## 🔧 Hooks configurés

### Pre-commit (avant chaque commit)

- ✅ **Type checking TypeScript** (`tsc --noEmit`)
- ✅ **ESLint + Prettier** sur les fichiers modifiés (`lint-staged`)
- ✅ **Tests** (`vitest run`)

### Pre-push (avant chaque push)

- ✅ **ESLint complet** sur tout le projet
- ✅ **Type checking TypeScript**
- ✅ **Build check** (vérifie que le build fonctionne)

## 🚀 Scripts disponibles

```bash
# Checks manuels
yarn lint              # ESLint sur tout le projet
yarn lint:fix          # ESLint + correction automatique
yarn type-check        # Vérification TypeScript
yarn format            # Formatage Prettier
yarn format:check      # Vérification formatage

# Tests
yarn test:run          # Tests unitaires
yarn test:coverage     # Tests avec couverture

# Build
yarn build            # Build de production
```

## ⚙️ Configuration lint-staged

Les fichiers sont automatiquement corrigés lors du commit :

- **`.ts`, `.tsx`** → ESLint fix + Prettier
- **`.js`, `.jsx`, `.json`, `.css`, `.scss`, `.md`** → Prettier

## 🚫 Désactiver temporairement

```bash
# Désactiver pour un commit (non recommandé)
git commit --no-verify -m "message"

# Désactiver pour un push (non recommandé)
git push --no-verify
```

## 🔧 Maintenance

Si les hooks ne fonctionnent pas :

```bash
# Réinstaller les hooks
cd Cardoon
yarn prepare

# Vérifier la configuration
git config core.hooksPath
```
