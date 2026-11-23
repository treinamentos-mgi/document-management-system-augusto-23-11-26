const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDir;
process.env.MAX_FILE_SIZE_MB = '1';

const app = require('../src/app');

const OWNER = 'user-a';
const OTHER_OWNER = 'user-b';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(storageDir, { recursive: true, force: true });
});

function uploadRequest({ owner = OWNER, content = 'conteúdo', filename = 'contrato.txt', type = 'text/plain' } = {}) {
  const form = new FormData();
  if (content !== null) {
    form.append('file', new Blob([content], { type }), filename);
  }
  const headers = owner === null ? {} : { 'X-User-Id': owner };
  return fetch(`${baseUrl}/upload`, { method: 'POST', body: form, headers });
}

async function uploadDocument(options) {
  const response = await uploadRequest(options);
  assert.strictEqual(response.status, 201);
  return response.json();
}

test('POST /upload grava o arquivo e devolve os metadados sem storedName', async () => {
  const body = await uploadDocument({ content: 'olá mundo', filename: 'contrato.txt' });

  assert.strictEqual(body.originalName, 'contrato.txt');
  assert.strictEqual(body.mimeType, 'text/plain');
  assert.strictEqual(body.size, Buffer.byteLength('olá mundo'));
  assert.strictEqual(body.owner, OWNER);
  assert.strictEqual(body.storedName, undefined);
  assert.ok(body.id && body.uploadedAt);
  assert.strictEqual(fs.readdirSync(storageDir).length > 0, true);
});

test('POST /upload rejeita requisição sem X-User-Id com 400', async () => {
  const response = await uploadRequest({ owner: null });
  assert.strictEqual(response.status, 400);
});

test('POST /upload rejeita requisição sem arquivo com 400', async () => {
  const response = await uploadRequest({ content: null });
  assert.strictEqual(response.status, 400);
});

test('POST /upload rejeita arquivo acima do limite com 413', async () => {
  const response = await uploadRequest({ content: 'x'.repeat(1024 * 1024 + 1) });
  assert.strictEqual(response.status, 413);
});

test('GET /documents lista somente os documentos do usuário', async () => {
  const mine = await uploadDocument({ owner: 'user-list', filename: 'a.txt' });
  await uploadDocument({ owner: 'user-other-list', filename: 'b.txt' });

  const response = await fetch(`${baseUrl}/documents`, { headers: { 'X-User-Id': 'user-list' } });
  assert.strictEqual(response.status, 200);
  const list = await response.json();

  assert.deepStrictEqual(list.map((doc) => doc.id), [mine.id]);
  assert.strictEqual(list[0].storedName, undefined);
});

test('GET /documents/:id/download devolve o conteúdo ao dono', async () => {
  const doc = await uploadDocument({ owner: 'user-download', content: 'dados', filename: 'relatorio.txt' });

  const response = await fetch(`${baseUrl}/documents/${doc.id}/download`, {
    headers: { 'X-User-Id': 'user-download' },
  });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(await response.text(), 'dados');
  assert.match(response.headers.get('content-type'), /^text\/plain/);
  assert.match(response.headers.get('content-disposition'), /^attachment; filename="relatorio\.txt"/);
});

test('GET /documents/:id/download bloqueia outro usuário com 403', async () => {
  const doc = await uploadDocument({ owner: OWNER, filename: 'privado.txt' });

  const response = await fetch(`${baseUrl}/documents/${doc.id}/download`, {
    headers: { 'X-User-Id': OTHER_OWNER },
  });

  assert.strictEqual(response.status, 403);
});

test('GET /documents/:id/download retorna 404 para identificador inexistente', async () => {
  const response = await fetch(`${baseUrl}/documents/nao-existe/download`, {
    headers: { 'X-User-Id': OWNER },
  });

  assert.strictEqual(response.status, 404);
});
