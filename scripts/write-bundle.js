const fs = require('node:fs');
const path = require('node:path');
const uglify = require('uglify-js');

// Validate minification before writing the readable and minified browser bundles.
module.exports = function writeBundle(name, source) {
  const result = uglify.minify(source, {
    compress: true,
    mangle: true,
    output: { ascii_only: true, comments: /^!/ }
  });
  if (result.error) throw result.error;
  const directory = path.resolve(__dirname, '../dist');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, name + '.js'), source.trimEnd() + '\n');
  fs.writeFileSync(path.join(directory, name + '.min.js'), result.code + '\n');
  console.log('Built dist/' + name + '.js and dist/' + name + '.min.js');
};
