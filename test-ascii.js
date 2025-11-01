#!/usr/bin/env node

/**
 * Test script to verify all documentation files contain only ASCII characters
 * Usage: node test-ascii.js
 */

const fs = require('fs');
const path = require('path');

// Files to check for ASCII-only content
const docsToCheck = [
  'README.md',
  'CLAUDE.md',
  'EMBEDDING_GUIDE.md',
  'USAGE_SUMMARY.md',
  'docs/research.md'
];

let hasErrors = false;

console.log('Checking documentation files for non-ASCII characters...\n');

docsToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP: ${filePath} (file not found)`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  lines.forEach((line, index) => {
    for (let i = 0; i < line.length; i++) {
      const charCode = line.charCodeAt(i);
      // ASCII characters are 0-127
      if (charCode > 127) {
        const char = line.charAt(i);
        const displayChar = char === '\uFFFD' ? '�' : char;
        errors.push({
          line: index + 1,
          column: i + 1,
          char: displayChar,
          charCode: charCode,
          context: line.substring(Math.max(0, i - 20), Math.min(line.length, i + 20))
        });
      }
    }
  });

  if (errors.length > 0) {
    hasErrors = true;
    console.log(`❌ FAIL: ${filePath}`);
    console.log(`   Found ${errors.length} non-ASCII character(s):\n`);

    // Show up to 10 errors per file
    errors.slice(0, 10).forEach(err => {
      console.log(`   Line ${err.line}, Column ${err.column}:`);
      console.log(`   Character: '${err.char}' (code: ${err.charCode})`);
      console.log(`   Context: ...${err.context}...`);
      console.log('');
    });

    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more\n`);
    }
  } else {
    console.log(`✓ PASS: ${filePath}`);
  }
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ TEST FAILED: Some files contain non-ASCII characters');
  console.log('Please replace non-ASCII characters with ASCII equivalents.');
  process.exit(1);
} else {
  console.log('✓ TEST PASSED: All documentation files are ASCII-only');
  process.exit(0);
}
