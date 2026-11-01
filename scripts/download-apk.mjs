import { mkdirSync, existsSync, createWriteStream, statSync } from 'node:fs';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const APK_URL =
  'https://github.com/webdriverio/native-demo-app/releases/download/v2.2.0/android.wdio.native.app.v2.2.0.apk';
const OUT_DIR = join(process.cwd(), 'apps');
const OUT_FILE = join(OUT_DIR, 'android.wdio.native.app.v2.2.0.apk');

mkdirSync(OUT_DIR, { recursive: true });

if (existsSync(OUT_FILE) && statSync(OUT_FILE).size > 50_000_000) {
  console.log(`APK já existe: ${OUT_FILE}`);
  process.exit(0);
}

console.log(`Baixando ${APK_URL} ...`);
const response = await fetch(APK_URL, { redirect: 'follow' });

if (!response.ok || !response.body) {
  console.error(`Falha no download: HTTP ${response.status}`);
  process.exit(1);
}

await pipeline(Readable.fromWeb(response.body), createWriteStream(OUT_FILE));

const sizeMb = (statSync(OUT_FILE).size / (1024 * 1024)).toFixed(1);
console.log(`Salvo em ${OUT_FILE} (${sizeMb} MB)`);
