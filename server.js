const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ML_BASE = 'https://api.mercadolibre.com';

function mlProxy(reqUrl, res) {
  const parsed = url.parse(reqUrl, true);
  const mlPath = parsed.query.path;
  if (!mlPath) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'missing path' }));
    return;
  }
  const targetUrl = ML_BASE + mlPath;
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'es-AR,es;q=0.9',
      'Referer': 'https://www.mercadolibre.com.ar/',
      'Origin': 'https://www.mercadolibre.com.ar'
    }
  };
  https.get(targetUrl, options, (mlRes) => {
    let data = '';
    mlRes.on('data', chunk => data += chunk);
    mlRes.on('end', () => {
      res.writeHead(mlRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  }).on('error', (e) => {
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/api/ml') {
    mlProxy(req.url, res);
    return;
  }

  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lustgrow ML running on port ${PORT}`);
});
