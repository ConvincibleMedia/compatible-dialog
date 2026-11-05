const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const port = Number(process.env.PORT) || 4176;
const directories = {
  '/fixtures/': path.join(root, 'tests/fixtures'),
  '/dist/': path.join(root, 'dist'),
};
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };

// Only expose fixture and distribution assets, with traversal rejected.
http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  if (pathname === '/') pathname = '/fixtures/wrapper.html';
  const prefix = Object.keys(directories).find(entry => pathname.startsWith(entry));
  if (!prefix) {
    response.writeHead(404).end('Not found');
    return;
  }
  const directory = directories[prefix];
  const filename = path.resolve(directory, pathname.slice(prefix.length));
  const relative = path.relative(directory, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(filename, (error, contents) => {
    if (error) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' });
    response.end(contents);
  });
}).listen(port, 'localhost', () => console.log('Fixtures at http://localhost:' + port));
