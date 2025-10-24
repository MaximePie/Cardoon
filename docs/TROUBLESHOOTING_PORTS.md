# 🐛 Guide de Résolution des Problèmes de Port

## Erreur EADDRINUSE (Port déjà utilisé)

### Symptômes

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

### Solutions Rapides

#### Option 1: Script automatique (Recommandé)

```bash
# Nettoyer le port 3000 et redémarrer
npm run dev:clean
```

#### Option 2: Commandes manuelles

```bash
# 1. Trouver le processus utilisant le port
netstat -ano | findstr :3000

# 2. Tuer le processus (remplacer PID par le numéro trouvé)
cmd //c "taskkill /PID <PID> /F"

# 3. Redémarrer le serveur
npm run dev
```

#### Option 3: Script utilitaire

```bash
# Tuer tous les processus sur le port 3000
npm run kill-port
```

### Solutions Préventives

#### 1. Toujours arrêter proprement

- Utiliser `Ctrl+C` pour arrêter le serveur
- Éviter de fermer brutalement le terminal

#### 2. Vérifier avant de démarrer

```bash
# Vérifier si le port est libre
netstat -ano | findstr :3000
```

#### 3. Utiliser un port différent (si nécessaire)

```bash
# Démarrer sur un autre port
PORT=3001 npm run dev
```

### Ports Utilisés par le Projet

| Service         | Port      | URL                   |
| --------------- | --------- | --------------------- |
| Backend API     | 3000      | http://localhost:3000 |
| Frontend (Vite) | 5173/5174 | http://localhost:5173 |
| MongoDB         | 27017     | -                     |

### Scripts NPM Disponibles

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Démarrer le serveur normalement     |
| `npm run dev:clean` | Nettoyer le port et démarrer        |
| `npm run kill-port` | Tuer les processus sur le port 3000 |

### Contact Support

Si les problèmes persistent :

1. Vérifier que MongoDB fonctionne
2. Contrôler les variables d'environnement
3. Redémarrer votre machine si nécessaire

---

> **Note**: Ces commandes sont spécifiques à Windows. Pour Linux/Mac, utilisez `lsof -ti:3000 | xargs kill -9`
