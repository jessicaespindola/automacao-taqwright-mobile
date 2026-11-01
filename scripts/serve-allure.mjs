#!/usr/bin/env node
/**
 * Serve o Allure HTML via HTTP (evita "500 Failed to fetch" do file://)
 * e abre o navegador.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const reportDir = resolve(process.argv[2] || join(process.cwd(), 'reports', 'allure-report'));
const preferredPort = Number(process.env.ALLURE_PORT || 5051);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(reportDir)) {
  console.error(`[allure-serve] Pasta não encontrada: ${reportDir}`);
  process.exit(1);
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
    const filePath = normalize(join(reportDir, relative));

    if (!filePath.startsWith(reportDir + sep) && filePath !== reportDir) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const data = await readFile(finalPath);
    const type = MIME[extname(finalPath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

function listen(port) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && port !== 0) {
      listen(0);
      return;
    }
    console.error('[allure-serve] Erro ao subir servidor:', err);
    process.exit(1);
  });

  server.listen(port, '127.0.0.1', () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    const url = `http://127.0.0.1:${actualPort}/`;
    console.log(`[allure-serve] Relatório em ${url}`);
    console.log(`[allure-serve] Pasta: ${reportDir}`);
    console.log('[allure-serve] Deixe este processo aberto enquanto visualiza o relatório.');
    openBrowser(url);
  });
}

listen(preferredPort);
