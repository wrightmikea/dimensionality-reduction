#!/usr/bin/env node

/**
 * Script to add footer script to all HTML files
 */

const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index_pca.html',
  'index_lda.html',
  'index_isomap.html',
  'index_embeddings.html',
  'index_comparison.html',
  'index_ollama.html'
];

const footerScript = '    <script src="dist/footer.js"></script>\n';

htmlFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP: ${file} (file not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if footer script is already added
  if (content.includes('dist/footer.js')) {
    console.log(`✓ SKIP: ${file} (footer already added)`);
    return;
  }

  // Add footer script before closing </body> tag
  content = content.replace('</body>', footerScript + '</body>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ ADDED: ${file}`);
});

console.log('\nDone!');
