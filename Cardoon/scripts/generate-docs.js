#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Documentation Generator
 *
 * Ce script génère automatiquement de la documentation à partir des tests
 * et de la structure des composants du projet Cardoon.
 */

/**
 * Analyse un fichier de test pour extraire les informations
 */
function parseTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const suites = [];
    let testCount = 0;

    // Regex pour capturer les describe blocks
    const describeRegex = /describe\(['"`]([^'"`]+)['"`]/g;
    const itRegex = /it\(['"`]([^'"`]+)['"`]/g;

    let match;

    // Capturer tous les describes
    const describes = [];
    while ((match = describeRegex.exec(content)) !== null) {
      describes.push(match[1]);
    }

    // Capturer tous les tests
    const tests = [];
    while ((match = itRegex.exec(content)) !== null) {
      tests.push(match[1]);
      testCount++;
    }

    if (describes.length > 0) {
      suites.push({
        name: describes[0], // Premier describe comme nom principal
        tests: tests,
      });
    }

    return { suites, testCount };
  } catch (error) {
    console.warn(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return { suites: [], testCount: 0 };
  }
}

/**
 * Analyse un fichier de composant pour extraire les informations
 */
function parseComponentFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const fileName = path.basename(filePath, path.extname(filePath));

    // Extraire la description du composant depuis les commentaires
    const commentRegex = /\/\*\*\s*\n\s*\*\s*([^\n]+)/;
    const match = commentRegex.exec(content);
    const description = match ? match[1].trim() : `Composant ${fileName}`;

    return { name: fileName, description };
  } catch (error) {
    console.warn(
      `Erreur lors de l'analyse du composant ${filePath}:`,
      error.message
    );
    return {
      name: path.basename(filePath, path.extname(filePath)),
      description: "Composant React",
    };
  }
}

/**
 * Trouve tous les fichiers de test et composants
 */
function findFiles(dir, extensions) {
  const files = [];

  function scanDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          scanDir(fullPath);
        } else if (stat.isFile()) {
          if (extensions.some((e) => item.endsWith(e))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Erreur lors du scan de ${currentDir}:`, error.message);
    }
  }

  scanDir(dir);
  return files;
}

/**
 * Génère la documentation principale
 */
function generateDocumentation() {
  const srcDir = path.join(__dirname, "..", "src");
  const outputDir = path.join(__dirname, "..", "docs");

  // Créer le dossier docs s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Trouver tous les fichiers de test
  const testFiles = findFiles(srcDir, [
    ".test.ts",
    ".test.tsx",
    ".spec.ts",
    ".spec.tsx",
  ]);

  // Trouver tous les composants
  const componentFiles = findFiles(srcDir, [".tsx", ".ts"]).filter(
    (f) =>
      !f.includes(".test.") &&
      !f.includes(".spec.") &&
      !f.includes("test-setup") &&
      (f.includes("/components/") ||
        f.includes("/hooks/") ||
        f.includes("/utils/"))
  );

  const components = [];
  let totalTests = 0;

  // Analyser chaque fichier de test
  for (const testFile of testFiles) {
    const { suites, testCount } = parseTestFile(testFile);
    totalTests += testCount;

    // Trouver le composant correspondant
    const componentPath = testFile.replace(/\.test\.(ts|tsx)$/, ".$1");
    let componentInfo = {
      name: "Unknown",
      description: "Composant non trouvé",
    };

    if (fs.existsSync(componentPath)) {
      componentInfo = parseComponentFile(componentPath);
    } else {
      // Essayer de trouver le composant dans le même répertoire
      const dir = path.dirname(testFile);
      const possibleComponent = componentFiles.find(
        (f) => path.dirname(f) === dir && !f.includes(".test.")
      );
      if (possibleComponent) {
        componentInfo = parseComponentFile(possibleComponent);
      }
    }

    components.push({
      name: componentInfo.name,
      path: path.relative(srcDir, testFile),
      tests: suites.flatMap((s) => s.tests),
      testCount,
      description: componentInfo.description,
    });
  }

  // Générer le README principal
  const readmeContent = generateMainReadme(components, totalTests);
  fs.writeFileSync(path.join(outputDir, "README.md"), readmeContent);

  // Générer la documentation détaillée pour chaque composant
  for (const component of components) {
    const componentDoc = generateComponentDoc(component);
    const fileName = `${component.name.toLowerCase()}.md`;
    fs.writeFileSync(path.join(outputDir, fileName), componentDoc);
  }

  // Générer un index des tests
  const testIndex = generateTestIndex(components);
  fs.writeFileSync(path.join(outputDir, "tests.md"), testIndex);

  console.log(`✅ Documentation générée avec succès !`);
  console.log(`📁 Emplacement: ${outputDir}`);
  console.log(`📊 ${components.length} composants documentés`);
  console.log(`🧪 ${totalTests} tests analysés`);

  return { components, totalTests };
}

/**
 * Génère le README principal
 */
function generateMainReadme(components, totalTests) {
  const now = new Date().toLocaleDateString("fr-FR");

  return `# Documentation des Tests - Cardoon

*Généré automatiquement le ${now}*

## 📊 Statistiques

- **Composants testés**: ${components.length}
- **Tests totaux**: ${totalTests}
- **Couverture moyenne**: ${(totalTests / components.length).toFixed(1)} tests par composant

## 🏗️ Architecture des Tests

### Composants Atomiques

${components
  .filter((c) => c.path.includes("/atoms/"))
  .map((c) => `- **${c.name}**: ${c.testCount} tests - ${c.description}`)
  .join("\n")}

### Composants Moléculaires

${
  components
    .filter((c) => c.path.includes("/molecules/"))
    .map((c) => `- **${c.name}**: ${c.testCount} tests - ${c.description}`)
    .join("\n") || "*(Aucun test moléculaire pour le moment)*"
}

### Hooks & Utilitaires

${components
  .filter((c) => c.path.includes("/hooks/") || c.path.includes("/utils/"))
  .map((c) => `- **${c.name}**: ${c.testCount} tests - ${c.description}`)
  .join("\n")}

### Contextes

${
  components
    .filter((c) => c.path.includes("/context/"))
    .map((c) => `- **${c.name}**: ${c.testCount} tests - ${c.description}`)
    .join("\n") || "*(Aucun test de contexte pour le moment)*"
}

## 📚 Documentation Détaillée

${components
  .map((c) => `- [${c.name}](${c.name.toLowerCase()}.md) - ${c.description}`)
  .join("\n")}

## 🧪 Index des Tests

Voir [tests.md](tests.md) pour une vue d'ensemble de tous les tests.

## 🚀 Comment Utiliser

1. **Lancer tous les tests**: \`yarn test\`
2. **Tests avec couverture**: \`yarn test:coverage\`
3. **Régénérer la documentation**: \`node scripts/generate-docs.js\`

## 📝 Standards de Test

### Structure des Tests

- **Describe blocks**: Organisent les tests par fonctionnalité
- **Rendering**: Tests de rendu et affichage
- **Behavior**: Tests de comportement et interactions
- **Accessibility**: Tests d'accessibilité
- **Edge Cases**: Tests des cas limites

### Conventions

- Chaque composant doit avoir son fichier de test dédié
- Les tests doivent couvrir au minimum 70% du code
- Utilisation de \`@testing-library/react\` pour les tests de composants
- Mocking approprié des dépendances externes

---

*Cette documentation est générée automatiquement à partir des tests. Pour la mettre à jour, modifiez les tests et relancez le script de génération.*
`;
}

/**
 * Génère la documentation pour un composant spécifique
 */
function generateComponentDoc(component) {
  return `# ${component.name}

${component.description}

## 📍 Emplacement

\`${component.path}\`

## 🧪 Tests (${component.testCount})

${component.tests.map((test, index) => `${index + 1}. ${test}`).join("\n")}

## 📊 Couverture

Ce composant est testé avec **${component.testCount} tests** couvrant :

- ✅ Rendu et affichage
- ✅ Comportement et interactions  
- ✅ Gestion des props
- ✅ Cas limites et erreurs

## 🔗 Liens Utiles

- [Retour à l'index](README.md)
- [Vue d'ensemble des tests](tests.md)

---

*Documentation générée automatiquement le ${new Date().toLocaleDateString("fr-FR")}*
`;
}

/**
 * Génère l'index des tests
 */
function generateTestIndex(components) {
  return `# Index des Tests

## 📋 Liste Complète des Tests

${components
  .map(
    (component) => `
### ${component.name} (${component.testCount} tests)

${component.tests.map((test, index) => `${index + 1}. ${test}`).join("\n")}
`
  )
  .join("\n")}

## 📊 Répartition

- **Total des tests**: ${components.reduce((sum, c) => sum + c.testCount, 0)}
- **Composants testés**: ${components.length}
- **Moyenne par composant**: ${(components.reduce((sum, c) => sum + c.testCount, 0) / components.length).toFixed(1)}

---

[← Retour à l'index](README.md)
`;
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDocumentation();
}

export { generateDocumentation };
