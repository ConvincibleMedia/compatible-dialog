const fs = require('node:fs');
const path = require('node:path');
const writeBundle = require('./write-bundle');

const source = fs.readFileSync(path.resolve(__dirname, '../src/dialog.js'), 'utf8');
writeBundle('dialog', source);

// Preserve the adjacent fallback assets and their upstream licence.
fs.cpSync(path.resolve(__dirname, '../src/polyfill'), path.resolve(__dirname, '../dist/polyfill'), { recursive: true });
