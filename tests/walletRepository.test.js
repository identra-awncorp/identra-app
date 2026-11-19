const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const {
  createSqliteCredentialRepository,
  migrateWalletDatabase,
  WalletDatabaseError,
  WALLET_SCHEMA_VERSION,
} = require('../.tmp-test/src/native/data/wallet/credentialRepository');
const { createExpoRandomSource } = require('../.tmp-test/src/native/data/wallet/randomSource');
const { createCredentialVault, createInMemorySecretStorage } = require('@identra/sdk-app');
const { openExpoSqliteDouble } = require('./helpers/expoSqliteDouble');

const random = createExpoRandomSource((a) => webcrypto.getRandomValues(a));
const row = (id, extra = {}) => ({
  id,
  vct: 'https://identra.awncorp.vn/vct/bang-tot-nghiep/v1',
  issuer: 'https://dai-hoc.example.vn',
  key_id: `key-${id}`,
  ciphertext: `sealed-${id}`,
  status_cache: null,
  status_checked_at: null,
  created_at: '2026-11-19T00:00:00.000Z',
  ...extra,
});

describe('CredentialRepository on expo-sqlite (SQL executed by node:sqlite)', () => {
  it('creates the SDK table and records the schema version in PRAGMA user_version', async () => {
    const db = openExpoSqliteDouble();
    const repo = createSqliteCredentialRepository(async () => db);
    assert.deepEqual(await repo.list(), []);
    assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, WALLET_SCHEMA_VERSION);
    const columns = db.raw.prepare('PRAGMA table_info(credentials)').all().map((c) => c.name);
    assert.deepEqual(columns, ['id', 'vct', 'issuer', 'key_id', 'ciphertext', 'status_cache', 'status_checked_at', 'created_at']);
    // Migrating again is a no-op.
    const before = db.sql.length;
    await migrateWalletDatabase(db);
    assert.equal(db.sql.slice(before).some((s) => s.includes('CREATE TABLE')), false);
  });

  it('implements insert, list, get, update and delete with the SDK semantics', async () => {
    const db = openExpoSqliteDouble();
    const repo = createSqliteCredentialRepository(async () => db);
    await repo.insert(row('b', { created_at: '2026-11-19T00:00:02.000Z' }));
    await repo.insert(row('a', { created_at: '2026-11-19T00:00:01.000Z' }));
    assert.deepEqual((await repo.list()).map((r) => r.id), ['a', 'b']);
    assert.deepEqual(await repo.get('a'), row('a', { created_at: '2026-11-19T00:00:01.000Z' }));
    assert.equal(await repo.get('missing'), null);

    await repo.update('a', { status_cache: 'revoked', status_checked_at: '2026-11-19T01:00:00.000Z' });
    assert.equal((await repo.get('a')).status_cache, 'revoked');
    await repo.update('missing', { status_cache: 'valid', status_checked_at: null });

    await repo.delete('a');
    await repo.delete('a');
    assert.deepEqual((await repo.list()).map((r) => r.id), ['b']);
  });

  it('rejects a duplicate id and a status outside the CHECK constraint, without leaking values', async () => {
    const db = openExpoSqliteDouble();
    const repo = createSqliteCredentialRepository(async () => db);
    await repo.insert(row('dup'));
    await assert.rejects(repo.insert(row('dup', { ciphertext: 'SECRET-CIPHERTEXT' })), (error) => {
      assert.ok(error instanceof WalletDatabaseError);
      assert.equal(error.code, 'QUERY_FAILED');
      assert.equal(error.message.includes('SECRET'), false);
      return true;
    });
    await assert.rejects(repo.update('dup', { status_cache: 'bogus', status_checked_at: null }), WalletDatabaseError);
    assert.equal((await repo.get('dup')).ciphertext, 'sealed-dup');
  });

  it('binds every value: no row value ever appears in the SQL text, even hostile ones', async () => {
    const db = openExpoSqliteDouble();
    const repo = createSqliteCredentialRepository(async () => db);
    const hostile = "x'); DROP TABLE credentials; --";
    await repo.insert(row(hostile, { vct: hostile, issuer: hostile, key_id: hostile, ciphertext: hostile }));
    assert.equal((await repo.get(hostile)).vct, hostile);
    await repo.update(hostile, { status_cache: 'valid', status_checked_at: hostile });
    await repo.delete(hostile);
    assert.equal(db.sql.some((s) => s.includes('DROP TABLE')), false);
    assert.equal(db.sql.some((s) => s.includes('sealed') || s.includes('dai-hoc')), false);
  });

  it('runs one statement at a time in call order', async () => {
    const db = openExpoSqliteDouble(':memory:', { delayMs: 2 });
    const repo = createSqliteCredentialRepository(async () => db);
    const results = await Promise.all([
      repo.insert(row('1')),
      repo.get('1'),
      repo.update('1', { status_cache: 'valid', status_checked_at: null }),
      repo.get('1'),
      repo.delete('1'),
      repo.list(),
    ]);
    assert.equal(db.stats.maxConcurrent, 1);
    assert.equal(results[1].status_cache, null);
    assert.equal(results[3].status_cache, 'valid');
    assert.deepEqual(results[5], []);
  });

  it('keeps working after a failed statement and retries a failed open', async () => {
    let opens = 0;
    const db = openExpoSqliteDouble();
    const repo = createSqliteCredentialRepository(async () => {
      opens += 1;
      if (opens === 1) throw new Error('disk I/O error at /data/user/0/.../identra-wallet.db');
      return db;
    });
    await assert.rejects(repo.list(), (e) => e.code === 'QUERY_FAILED' && !e.message.includes('/data'));
    assert.deepEqual(await repo.list(), []);
    await repo.insert(row('x'));
    await assert.rejects(repo.insert(row('x')), WalletDatabaseError);
    assert.equal((await repo.list()).length, 1);
    assert.equal(opens, 2);
  });

  it('migrates a version-1 database with rows to version 2 (CHECK now allows invalid) without losing a row', async () => {
    const db = openExpoSqliteDouble();
    // The exact table the previous app version created (identra-sdk before 373a673), with rows.
    db.raw.exec(`CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY NOT NULL,
  vct TEXT NOT NULL,
  issuer TEXT NOT NULL,
  key_id TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  status_cache TEXT CHECK (status_cache IN ('valid', 'revoked', 'suspended', 'unavailable')),
  status_checked_at TEXT,
  created_at TEXT NOT NULL
); PRAGMA user_version = 1;`);
    const insert = db.raw.prepare('INSERT INTO credentials (id, vct, issuer, key_id, ciphertext, status_cache, status_checked_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insert.run('r1', 'v', 'i', 'k1', 'sealed-1', 'valid', '2026-11-18T00:00:00.000Z', '2026-11-17T00:00:00.000Z');
    insert.run('r2', 'v', 'i', 'k2', 'sealed-2', null, null, '2026-11-18T00:00:00.000Z');
    assert.throws(() => db.raw.exec("UPDATE credentials SET status_cache = 'invalid' WHERE id = 'r1'"), /CHECK/);

    const repo = createSqliteCredentialRepository(async () => db);
    assert.deepEqual((await repo.list()).map((r) => [r.id, r.ciphertext, r.status_cache]), [['r1', 'sealed-1', 'valid'], ['r2', 'sealed-2', null]]);
    assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, WALLET_SCHEMA_VERSION);
    assert.equal(WALLET_SCHEMA_VERSION, 2);
    await repo.update('r1', { status_cache: 'invalid', status_checked_at: '2026-11-19T00:00:00.000Z' });
    assert.equal((await repo.get('r1')).status_cache, 'invalid');
    assert.equal(db.raw.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name = 'credentials_v1'").get().n, 0, 'the old table is gone');
    await assert.rejects(repo.update('r2', { status_cache: 'bogus', status_checked_at: null }), WalletDatabaseError);
  });

  it('rolls the migration back when it fails: the old table and rows stay', async () => {
    const db = openExpoSqliteDouble();
    db.raw.exec(`CREATE TABLE credentials (id TEXT PRIMARY KEY NOT NULL, vct TEXT NOT NULL, issuer TEXT NOT NULL, key_id TEXT NOT NULL, ciphertext TEXT NOT NULL, status_cache TEXT, status_checked_at TEXT, created_at TEXT NOT NULL);
      CREATE TABLE credentials_v1 (x TEXT); PRAGMA user_version = 1;`);
    db.raw.prepare("INSERT INTO credentials VALUES ('r1', 'v', 'i', 'k', 'sealed', NULL, NULL, 'now')").run();
    await assert.rejects(migrateWalletDatabase(db));
    assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 1);
    assert.equal(db.raw.prepare('SELECT count(*) AS n FROM credentials').get().n, 1);
  });

  it('refuses a database written by a newer app version', async () => {
    const db = openExpoSqliteDouble();
    db.raw.exec(`PRAGMA user_version = ${WALLET_SCHEMA_VERSION + 1}`);
    const repo = createSqliteCredentialRepository(async () => db);
    await assert.rejects(repo.list(), (e) => e instanceof WalletDatabaseError && e.code === 'SCHEMA_TOO_NEW');
  });

  it('carries the SDK vault end to end: sealed rows on disk, plaintext only through open()', async () => {
    const db = openExpoSqliteDouble();
    const vault = createCredentialVault({
      repository: createSqliteCredentialRepository(async () => db),
      secrets: createInMemorySecretStorage(),
      random,
      clock: { now: () => new Date('2026-11-19T00:00:00Z') },
    });
    const compact = 'eyJhbGciOiJFUzI1NiJ9.eyJob190ZW4iOiJOZ3V54buFbiBWxINuIEFuIn0.c2ln~WyJzYWx0IiwiaG9fdGVuIiwiTmd1eeG7hW4gVsSDbiBBbiJd~';
    const id = await vault.save({ compact, vct: 'https://identra.awncorp.vn/vct/bang-tot-nghiep/v1', issuer: 'https://dai-hoc.example.vn', keyId: 'AAAAAAAAAAAAAAAAAAAAAA' });
    const stored = db.raw.prepare('SELECT ciphertext FROM credentials WHERE id = ?').get(id).ciphertext;
    assert.equal(stored.includes('eyJ'), false);
    assert.equal(await vault.open(id), compact);
    await vault.setStatus(id, 'suspended', new Date('2026-11-19T02:00:00Z'));
    assert.equal((await vault.list())[0].status_cache, 'suspended');
    await vault.remove(id);
    assert.deepEqual(await vault.list(), []);
  });
});
