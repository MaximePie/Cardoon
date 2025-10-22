# 🤖 Renovate Configuration

Ce dossier contient la configuration [Renovate](https://docs.renovatebot.com/) pour automatiser les mises à jour de dépendances du projet Cardoon.

## 📋 Fichiers de Configuration

### `renovate.json` (Configuration Complète)

Configuration avancée avec :

- ✅ Groupement intelligent des dépendances par écosystème
- ✅ Auto-merge des patchs pour les devDependencies
- ✅ Gestion des alertes de sécurité
- ✅ Planification hebdomadaire (lundis 6h)
- ✅ Labels et assignation automatiques

### `renovate-simple.json` (Configuration Simple)

Configuration basique recommandée pour débuter :

- ✅ Configuration minimale mais efficace
- ✅ Auto-merge uniquement pour les patchs de devDependencies
- ✅ Groupement des mises à jour majeures

## 🚀 Mise en Place

### 1. Installation de l'App GitHub

1. Allez sur https://github.com/apps/renovate
2. Cliquez sur "Install"
3. Sélectionnez votre repository `MaximePie/Cardoon`
4. Autorisez l'accès

### 2. Configuration du Token (Optionnel)

Si vous utilisez le workflow GitHub Actions :

```bash
# Créez un token GitHub avec les permissions repo
# Ajoutez-le comme secret dans Settings > Secrets > Actions
# Nom du secret : RENOVATE_TOKEN
```

### 3. Choix de Configuration

**Débutant** : Renommez `renovate-simple.json` en `renovate.json`

```bash
mv renovate-simple.json renovate.json
rm renovate.json renovate-simple.json  # supprimez les autres
```

**Avancé** : Gardez `renovate.json` tel quel

## ⚙️ Fonctionnalités Configurées

### 🔄 Auto-merge

- **Patchs devDependencies** : Auto-merge activé
- **Autres updates** : Review manuelle requise

### 📅 Planification

- **Updates normales** : Lundis avant 6h du matin
- **Sécurité** : Immédiatement

### 🏷️ Labels et Organisation

- `dependencies` : Toutes les PRs de dépendances
- `renovate` : Identifie les PRs Renovate
- `security` : Alertes de sécurité
- `breaking-change` : Mises à jour majeures

### 📊 Dashboard

Un dashboard sera créé automatiquement dans les Issues pour suivre l'état des updates.

## 🛠️ Personnalisation

### Ajouter des Exceptions

```json
{
  "ignoreDeps": ["package-name"],
  "ignorePaths": ["**/examples/**"]
}
```

### Modifier la Planification

```json
{
  "schedule": ["after 10pm every weekday", "before 5am every weekday"]
}
```

### Grouper des Packages

```json
{
  "packageRules": [
    {
      "groupName": "React ecosystem",
      "matchPackagePatterns": ["^react", "^@types/react"]
    }
  ]
}
```

## 📚 Documentation

- [Renovate Docs](https://docs.renovatebot.com/)
- [Configuration Options](https://docs.renovatebot.com/configuration-options/)
- [Package Rules](https://docs.renovatebot.com/configuration-options/#packagerules)

## 🔍 Monitoring

- **Dashboard** : Consultez l'issue "Dependency Dashboard"
- **PRs** : Les PRs Renovate apparaîtront automatiquement
- **Logs** : Consultez les Actions GitHub pour les logs détaillés
