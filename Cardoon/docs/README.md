# Documentation des Tests - Cardoon

_Généré le 20/10/2025_

## 📊 Statistiques

- **Composants testés**: 5
- **Tests totaux**: 95
- **Couverture moyenne**: 19.0 tests par composant

## 🧪 Composants Testés

### Button (24 tests)

Fichier: `components\atoms\Button\Button.test.tsx`

Tests: 1. should render with children text 2. should render with custom className 3. should apply default button class 4. should combine custom className with default class 5. should render with icon 6. should render loading state 7. should apply primary variant by default 8. should apply danger variant 9. should apply secondary variant 10. should call onClick handler when clicked 11. should not call onClick when disabled 12. should be disabled when disabled prop is true 13. should be enabled by default 14. should have correct role 15. should have submit type by default 16. should support tooltip 17. should generate tooltip ID from content 18. should show loader when isLoading is true 19. should not show loader when isLoading is false 20. should still render children when loading 21. should render icon in correct wrapper 22. should render both icon and text 23. should handle all props together 24. should handle disabled loading button

### Hint (20 tests)

Fichier: `components\atoms\Hint\Hint.test.tsx`

Tests: 1. should render with basic props 2. should render with default className 3. should render with custom className 4. should combine default and custom className correctly 5. should render tooltip with correct content 6. should render tooltip with correct ID 7. should render tooltip with correct className 8. should render help icon with correct className 9. should render help icon with correct tooltip attributes 10. should use consistent ID between tooltip and icon 11. should handle different text lengths 12. should handle special characters in text 13. should handle empty text gracefully 14. should wrap icon and tooltip in span element 15. should maintain correct DOM structure 16. should provide proper tooltip association 17. should include descriptive content in tooltip attributes 18. should handle undefined customClassName 19. should handle multiple re-renders with different props 20. should use consistent ID between components

### Input (26 tests)

Fichier: `components\atoms\Input\Input.test.tsx`

Tests: 1. should render with basic props 2. should render with custom className 3. should render with default className when none provided 4. should render label correctly 5. should render required indicator when isRequired is true 6. should not render required indicator when isRequired is false 7. should render hint when provided 8. should not render hint when not provided 9. should set correct input type 10. should set correct input value 11. should set custom placeholder 12. should use label as placeholder when no placeholder provided 13. should set custom name attribute 14. should not have name attribute when not provided 15. should call onChange when input value changes 16. should handle multiple change events 17. should handle focus and blur events 18. should associate label with input 19. should handle complex labels with required indicator 20. should support keyboard navigation 21. should handle email input type 22. should handle password input type 23. should handle number input type 24. should handle all props together 25. should handle empty values gracefully 26. should preserve input focus after value changes

### errorUtils (18 tests)

Fichier: `utils\errorUtils.test.ts`

Tests: 1. should return 2. should return error message for basic Error objects 3. should prioritize API errorMessage over other messages 4. should fall back to API message when errorMessage is not available 5. should fall back to axios error message when API data is not available 6. should handle axios errors with empty response data 7. should handle axios errors with null response data 8. should return false for non-Error objects 9. should return false for basic Error objects 10. should return true for axios-like errors 11. should return true even with minimal axios error structure 12. should return null for non-axios errors 13. should return status code for axios errors 14. should return null when status is not available in axios error 15. should handle various HTTP status codes 16. should handle typical 404 API response 17. should handle validation errors with multiple messages 18. should handle network timeout errors

### utils (7 tests)

Fichier: `utils.test.ts`

Tests: 1. should return an array of the same length 2. should contain all original elements 3. should handle empty arrays 4. should handle single element arrays 5. should handle arrays with duplicate elements 6. should modify the original array 7. should handle different data types

## 🚀 Exécution des Tests

```bash
# Lancer tous les tests
yarn test

# Tests avec couverture
yarn test:coverage

# Régénérer cette documentation
yarn generate-docs
```

---

_Documentation générée automatiquement à partir des fichiers de test_
