# Loader Component

Un composant React simple et performant pour afficher un indicateur de chargement animé.

## 📋 Aperçu

Le composant `Loader` affiche un spinner animé avec deux cercles concentriques qui s'agrandissent progressivement. Il est conçu pour être léger, réutilisable et facilement personnalisable.

## 🚀 Utilisation

### Import

```tsx
import Loader from "./components/atoms/Loader/Loader";
```

### Usage basique

```tsx
function App() {
  return (
    <div>
      <h1>Chargement en cours...</h1>
      <Loader />
    </div>
  );
}
```

### Avec className personnalisée

```tsx
function App() {
  return (
    <div>
      <Loader className="my-custom-spinner" />
    </div>
  );
}
```

### Avec plusieurs classes

```tsx
function App() {
  return (
    <div>
      <Loader className="large centered pulsing" />
    </div>
  );
}
```

## 🎨 Props

| Prop        | Type                  | Défaut      | Description                                         |
| ----------- | --------------------- | ----------- | --------------------------------------------------- |
| `className` | `string \| undefined` | `undefined` | Classes CSS additionnelles à appliquer au composant |

## 🎯 Structure CSS

Le composant génère la structure HTML suivante :

```html
<span class="Loader [className-additionnelle]"></span>
```

### Animation CSS

Le composant utilise des pseudo-éléments `::before` et `::after` pour créer l'animation :

- Deux cercles animés avec `transform: scale()` et `opacity`
- Animation de 2 secondes en boucle infinie
- Délai d'animation de 1 seconde entre les deux cercles
- Couleurs : `#1800d1` (bleu foncé) et `#00eaff` (cyan)

## 🎛️ Personnalisation

### Taille personnalisée

```scss
.custom-size.Loader {
  width: 64px;
  height: 64px;

  &::before,
  &::after {
    width: 64px;
    height: 64px;
  }
}
```

### Couleurs personnalisées

```scss
.custom-colors.Loader {
  &::before {
    border-color: #ff6b6b; // Rouge
  }

  &::after {
    border-color: #4ecdc4; // Vert
  }
}
```

### Vitesse d'animation

```scss
.fast-animation.Loader {
  &::before,
  &::after {
    animation-duration: 1s; // Plus rapide
  }
}

.slow-animation.Loader {
  &::before,
  &::after {
    animation-duration: 4s; // Plus lent
  }
}
```

## 📱 Responsive Design

```scss
.responsive-loader.Loader {
  width: 32px;
  height: 32px;

  @media (min-width: 768px) {
    width: 48px;
    height: 48px;
  }

  @media (min-width: 1024px) {
    width: 64px;
    height: 64px;
  }
}
```

## ♿ Accessibilité

### Recommandations

Pour améliorer l'accessibilité, considérez ajouter :

```tsx
<Loader
  className="loading-spinner"
  aria-label="Contenu en cours de chargement"
  role="progressbar"
  aria-live="polite"
/>
```

### Screen Readers

Le composant est silencieux par défaut. Utilisez `aria-label` et `role="progressbar"` pour les lecteurs d'écran.

## 🧪 Tests

Le composant est livré avec une suite de tests complète couvrant :

- ✅ **Rendu de base** : Structure HTML et classes CSS
- ✅ **Props personnalisées** : Gestion de className
- ✅ **Cases limites** : Valeurs undefined, chaînes vides, caractères spéciaux
- ✅ **Instances multiples** : Rendu indépendant de plusieurs loaders
- ✅ **Comportement** : Consistance entre les rendus
- ✅ **Performance** : Structure DOM minimale
- ✅ **Intégration CSS** : Support des animations CSS

### Lancer les tests

```bash
npm test src/components/atoms/Loader/Loader.test.tsx
```

## 🚀 Performance

- **Empreinte DOM minimale** : Un seul élément `<span>`
- **Pas de JavaScript d'animation** : Animations CSS pures
- **Rendu optimisé** : Pas de re-rendu inutile
- **Bundle léger** : Code TypeScript minimaliste

## 🔧 Intégration

### Avec des états de chargement

```tsx
function DataComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <Loader className="data-loader" />
          <p>Chargement des données...</p>
        </div>
      ) : (
        <div className="data-display">{data && <DataList items={data} />}</div>
      )}
    </div>
  );
}
```

### Avec Suspense

```tsx
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<Loader className="suspense-loader" />}>
      <LazyComponent />
    </Suspense>
  );
}
```

## 🎯 Bonnes Pratiques

1. **Positionnement** : Utilisez CSS pour centrer le loader
2. **Contexte** : Ajoutez du texte explicatif quand approprié
3. **Timeout** : Implémentez des timeouts pour éviter les chargements infinis
4. **Fallback** : Prévoyez un message d'erreur si le chargement échoue
5. **Animations** : Respectez les préférences utilisateur (`prefers-reduced-motion`)

## 📋 Exemples Complets

### Loader de page

```tsx
function PageLoader() {
  return (
    <div className="page-loader">
      <Loader className="page-spinner" />
      <h2>Chargement de l'application...</h2>
    </div>
  );
}
```

### Loader inline

```tsx
function InlineLoader() {
  return (
    <span className="inline-loading">
      <Loader className="small-loader" /> Envoi en cours...
    </span>
  );
}
```

### Loader avec overlay

```tsx
function OverlayLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <Loader className="overlay-spinner" />
        <p>Traitement en cours...</p>
      </div>
    </div>
  );
}
```
