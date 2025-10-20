import fs from "fs";
import path from "path";

/**
 * Simple documentation generator for test files
 */

// Get the current directory
const currentDir = process.cwd();
const srcDir = path.join(currentDir, "src");
const docsDir = path.join(currentDir, "docs");

// Create docs directory if it doesn't exist
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

console.log("🚀 Génération de la documentation...");
console.log(`📁 Source: ${srcDir}`);
console.log(`📁 Destination: ${docsDir}`);

// Find all test files
function findTestFiles(dir) {
  const files = [];

  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        scan(fullPath);
      } else if (stat.isFile() && item.includes(".test.")) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// Parse test file for tests
function parseTests(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const tests = [];

  // Find all it() calls
  const itRegex = /it\(['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = itRegex.exec(content)) !== null) {
    tests.push(match[1]);
  }

  return tests;
}

const testFiles = findTestFiles(srcDir);
console.log(`🧪 ${testFiles.length} fichiers de test trouvés`);

let totalTests = 0;
const components = [];

for (const testFile of testFiles) {
  const tests = parseTests(testFile);
  totalTests += tests.length;

  const fileName = path.basename(testFile, ".test.tsx").replace(".test.ts", "");
  const relativePath = path.relative(srcDir, testFile);

  components.push({
    name: fileName,
    path: relativePath,
    testCount: tests.length,
    tests: tests,
  });

  console.log(`  ✅ ${fileName}: ${tests.length} tests`);
}

// Generate main README
const readme = `# Documentation des Tests - Cardoon

*Généré le ${new Date().toLocaleDateString("fr-FR")}*

## 📊 Statistiques

- **Composants testés**: ${components.length}
- **Tests totaux**: ${totalTests}
- **Couverture moyenne**: ${(totalTests / components.length).toFixed(1)} tests par composant

## 🧪 Composants Testés

${components
  .map(
    (c) =>
      `### ${c.name} (${c.testCount} tests)
  
  Fichier: \`${c.path}\`
  
  Tests:
  ${c.tests.map((test, i) => `  ${i + 1}. ${test}`).join("\n")}
  `
  )
  .join("\n")}

## 🚀 Exécution des Tests

\`\`\`bash
# Lancer tous les tests
yarn test

# Tests avec couverture
yarn test:coverage

# Régénérer cette documentation
yarn generate-docs
\`\`\`

---

*Documentation générée automatiquement à partir des fichiers de test*
`;

fs.writeFileSync(path.join(docsDir, "README.md"), readme);

console.log("✅ Documentation générée avec succès !");
console.log(`📊 ${components.length} composants documentés`);
console.log(`🧪 ${totalTests} tests analysés`);
console.log(`📁 Documentation disponible dans: ${docsDir}`);

export default {};
