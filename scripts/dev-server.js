// Local preview with the same API handlers used by Vercel. Never serve secrets.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (/^\/api\/(content|session|login|logout)$/.test(url.pathname)) {
      req.query = Object.fromEntries(url.searchParams);
      const chunks = []; let size = 0;
      for await (const chunk of req) {size += chunk.length;if(size>3600000){res.writeHead(413);res.end('Request too large');return;}chunks.push(chunk);}
      req.body = Buffer.concat(chunks).toString('utf8');
      res.status = code => {res.statusCode=code;return res;};
      res.json = body => {res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));};
      await require(path.join(root,url.pathname+'.js'))(req,res);return;
    }
    let file = decodeURIComponent(url.pathname).replace(/^\//,'') || 'index.html';
    if (['admin','cozy-nest','cozy-roots','cozy-arts','qr-codes'].includes(file)) file += '.html';
    const full = path.resolve(root,file);
    if (!full.startsWith(root+path.sep) || (!/^assets\//.test(file) && !/^[\w-]+\.html$/.test(file)) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {res.writeHead(404);res.end('Not found');return;}
    res.setHeader('Content-Type',mime[path.extname(full)] || 'application/octet-stream');
    fs.createReadStream(full).pipe(res);
  } catch (err) {res.writeHead(500);res.end('Local preview error');console.error(err.message);}
});
server.listen(process.env.PORT || 8934, '127.0.0.1', () => console.log('Guest guide preview: http://localhost:'+(process.env.PORT || 8934)));
