# 🚀 TanStack Query Implementation - Suppression Optimiste des Cartes

## 📋 Vue d'ensemble

Cette implémentation utilise **TanStack Query v5** pour gérer la suppression optimiste des cartes utilisateur dans l'application Cardoon. La suppression optimiste améliore significativement l'expérience utilisateur en rendant l'interface réactive instantanément, tout en gérant automatiquement les cas d'erreur avec rollback.

## 🎯 Fonctionnalités

### ✨ Suppression Optimiste

- **🚀 Réactivité instantanée** : La carte disparaît immédiatement de l'UI
- **🔄 Rollback automatique** : Restoration automatique en cas d'erreur serveur
- **📊 États de loading** : Indicateurs visuels durant les opérations
- **❌ Gestion d'erreur** : Messages d'erreur contextuels avec Snackbar

### 🏗️ Architecture

```
📁 src/
├── 📁 lib/
│   └── queryClient.ts          # Configuration TanStack Query
├── 📁 services/
│   └── userCardsApi.ts         # Services API pour les cartes
├── 📁 hooks/
│   └── useUserCards.ts         # Hooks TanStack Query
└── 📁 components/pages/UserPage/
    └── UserPage.tsx            # Interface utilisateur mise à jour
```

## 🔧 Installation et Configuration

### 1. Installation des dépendances

```bash
yarn add @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Configuration du QueryClient

Le `QueryClient` est configuré avec des paramètres optimisés :

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes de cache
      gcTime: 10 * 60 * 1000, // 10 minutes de garbage collection
      refetchOnWindowFocus: true, // Refetch au retour sur l'onglet
      retry: (failureCount, error) => {
        if (error.message.includes("404")) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### 3. Intégration dans l'App

```typescript
// src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      {/* ... autres providers */}
    </UserContextProvider>
  </QueryClientProvider>
);
```

## 📝 API et Utilisation

### Hook Principal : `useUserCardsManager`

```typescript
const {
  cards, // PopulatedUserCard[] - Liste des cartes
  isLoading, // boolean - État de chargement initial
  isDeletingCard, // boolean - État de suppression en cours
  deleteCard, // (cardId: string) => void - Fonction de suppression
  error, // Error | null - Erreur de récupération
  deleteError, // Error | null - Erreur de suppression
} = useUserCardsManager(userId, {
  onDeleteSuccess: () => showSuccess("Carte supprimée !"),
  onDeleteError: (error) => showError(`Erreur: ${error.message}`),
});
```

### Utilisation dans UserPage

```typescript
// Suppression avec confirmation
const handleDeleteCard = (cardId: string, cardQuestion: string) => {
  const confirmed = window.confirm(
    `Supprimer la carte ?\n\nQuestion: "${cardQuestion}"`
  );
  if (confirmed) {
    deleteCard(cardId); // Suppression optimiste automatique
  }
};

// Dans le JSX
<button
  onClick={() => handleDeleteCard(card.card._id, card.card.question)}
  disabled={isDeletingCard}
>
  {isDeletingCard ? '🔄 Suppression...' : '🗑️ Supprimer'}
</button>
```

## ⚡ Mécanisme de Suppression Optimiste

### 🔄 Flux de Suppression

1. **🎯 Trigger** : L'utilisateur clique sur "Supprimer"
2. **🚀 Optimistic Update** : Carte retirée immédiatement du cache/UI
3. **📡 API Call** : Requête de suppression envoyée au serveur
4. **✅ Success** : Confirmation de la suppression → État final
5. **❌ Error** : Rollback automatique → Carte restaurée + message d'erreur

### 🔧 Implémentation Technique

```typescript
// Dans useDeleteCard hook
onMutate: async (cardId) => {
  // 1. Annuler les requêtes en cours
  await queryClient.cancelQueries({ queryKey: userCardsQueryKey });

  // 2. Sauvegarder l'état actuel
  const previousCards = queryClient.getQueryData(userCardsQueryKey);

  // 3. Mise à jour optimiste
  queryClient.setQueryData(userCardsQueryKey, (oldCards) =>
    oldCards?.filter(card => card._id !== cardId)
  );

  return { previousCards }; // Contexte pour rollback
},

onError: (error, cardId, context) => {
  // 4. Rollback en cas d'erreur
  if (context?.previousCards) {
    queryClient.setQueryData(userCardsQueryKey, context.previousCards);
  }
},

onSettled: () => {
  // 5. Synchronisation finale
  queryClient.invalidateQueries({ queryKey: userCardsQueryKey });
}
```

## 🎨 Interface Utilisateur

### États Visuels

- **Loading Initial** : "Chargement des cartes..."
- **Suppression en cours** : Opacité réduite + boutons désactivés
- **États des boutons** :
  - Normal : "🗑️ Supprimer"
  - En cours : "🔄 Suppression..."
- **Messages de feedback** : Snackbar success/error

### Confirmation Utilisateur

```javascript
const confirmDelete = window.confirm(
  `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${cardQuestion}"`
);
```

## 📊 Gestion du Cache

### Query Keys Standardisées

```typescript
export const QueryKeys = {
  userCards: (userId) => ["users", userId, "cards"],
  user: (id) => ["users", id],
  // ... autres clés
};
```

### Stratégies de Cache

- **Stale Time** : 2 minutes pour les cartes (données modifiées fréquemment)
- **GC Time** : 10 minutes avant nettoyage
- **Refetch** : Auto sur focus/reconnexion

## 🚨 Gestion d'Erreur

### Types d'Erreurs Gérées

- **404** : Carte introuvable → Pas de retry
- **403** : Non autorisé → Message spécifique
- **401** : Session expirée → Demande de reconnexion
- **Network** : Erreurs réseau → Retry automatique

### Messages d'Erreur

```typescript
// Exemples de messages contextuels
"Carte introuvable (ID: abc123) - 404";
"Vous n'êtes pas autorisé à supprimer cette carte - 403";
"Session expirée, veuillez vous reconnecter - 401";
"Impossible de supprimer la carte: Erreur réseau";
```

## 🔍 DevTools et Debug

### React Query DevTools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Ajouté automatiquement en mode développement
<ReactQueryDevtools initialIsOpen={false} />
```

### Logging

- **Mutations** : Auto-log des erreurs dans la console
- **Contexte** : CardId, userId, error message dans les logs
- **Performance** : Métriques de cache dans DevTools

## 📈 Avantages de cette Implémentation

### 🚀 Performance

- **Réactivité** : UI instantanément responsive
- **Cache Intelligent** : Réduction des appels API
- **Background Updates** : Synchronisation transparente

### 🎯 UX/UI

- **Feedback Immédiat** : Pas d'attente utilisateur
- **États Visuels** : Loading states intuitifs
- **Gestion d'Erreur** : Messages clairs et rollback automatique

### 🔧 Maintenance

- **Code Déclaratif** : Logic métier séparée de l'UI
- **Type Safety** : TypeScript complet
- **Testabilité** : Hooks facilement mocables

## 🧪 Tests Recommandés

```typescript
// Tests à ajouter
describe("useDeleteCard", () => {
  it("should optimistically remove card from UI");
  it("should rollback on server error");
  it("should show success message on successful deletion");
  it("should handle 404 errors without retry");
});

describe("UserPage avec TanStack Query", () => {
  it("should display loading state while fetching cards");
  it("should show delete confirmation dialog");
  it("should disable buttons during deletion");
});
```

## 🚀 Prochaines Étapes

1. **✅ Suppression optimiste** - Implémentée
2. **🔄 Édition optimiste** - À implémenter
3. **➕ Création optimiste** - À implémenter
4. **📊 Pagination** - À considérer pour de grandes listes
5. **🔄 Synchronisation offline** - Fonctionnalité avancée

## 📚 Ressources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Error Handling Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)

---

**Version** : 1.0.0  
**Date** : Octobre 2025  
**Auteur** : Cardoon Team
