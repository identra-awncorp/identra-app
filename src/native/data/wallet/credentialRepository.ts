import { CREDENTIALS_TABLE_DDL, type CredentialRepository, type CredentialRow } from '@identra/sdk-app';

export const WALLET_DATABASE_NAME = 'identra-wallet.db';
/**
 * 1: the first table. 2: `status_cache` also allows 'invalid' (SDK 373a673): SQLite cannot alter a
 * CHECK constraint, so the table is recreated from the SDK's DDL and the rows copied, in one
 * transaction.
 */
export const WALLET_SCHEMA_VERSION = 2;

type Bind = string | number | null;

/** The expo-sqlite async methods this repository calls (a node:sqlite double implements the same in tests). */
export interface SqliteDatabaseLike {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: Bind[]): Promise<unknown>;
  getFirstAsync<T>(source: string, params: Bind[]): Promise<T | null>;
  getAllAsync<T>(source: string, params: Bind[]): Promise<T[]>;
}

export type WalletDatabaseErrorCode = 'SCHEMA_TOO_NEW' | 'QUERY_FAILED';

/** Code only: SQLite messages are dropped so no column value can leak into a log. */
export class WalletDatabaseError extends Error {
  readonly code: WalletDatabaseErrorCode;
  constructor(code: WalletDatabaseErrorCode) {
    super(`wallet database failed: ${code}`);
    this.name = 'WalletDatabaseError';
    this.code = code;
  }
}

const COLUMNS = 'id, vct, issuer, key_id, ciphertext, status_cache, status_checked_at, created_at';

/** Runs `source` as one transaction; on failure rolls back so the old schema and rows stay. */
async function inTransaction(db: SqliteDatabaseLike, source: string): Promise<void> {
  await db.execAsync('BEGIN IMMEDIATE;');
  try {
    await db.execAsync(source);
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;').catch(() => undefined);
    throw error;
  }
}

/** Brings the schema to WALLET_SCHEMA_VERSION; PRAGMA user_version holds the version. */
export async function migrateWalletDatabase(db: SqliteDatabaseLike): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  const version = row?.user_version ?? 0;
  if (version > WALLET_SCHEMA_VERSION) throw new WalletDatabaseError('SCHEMA_TOO_NEW');
  if (version === WALLET_SCHEMA_VERSION) return;
  if (version === 0) {
    // A new database (or a v0 one with no table yet): the current DDL directly.
    await inTransaction(db, `${CREDENTIALS_TABLE_DDL};\nPRAGMA user_version = ${WALLET_SCHEMA_VERSION};`);
    return;
  }
  // 1 -> 2: recreate with the new CHECK and copy every row unchanged.
  await inTransaction(
    db,
    `ALTER TABLE credentials RENAME TO credentials_v1;
${CREDENTIALS_TABLE_DDL};
INSERT INTO credentials (${COLUMNS}) SELECT ${COLUMNS} FROM credentials_v1;
DROP TABLE credentials_v1;
PRAGMA user_version = ${WALLET_SCHEMA_VERSION};`,
  );
}

/**
 * The SDK's CredentialRepository on expo-sqlite. Opens and migrates lazily on first use (retried
 * after a failure), runs one statement at a time in call order, and uses bound parameters only.
 */
export function createSqliteCredentialRepository(open: () => Promise<SqliteDatabaseLike>): CredentialRepository {
  let ready: Promise<SqliteDatabaseLike> | null = null;
  let tail: Promise<unknown> = Promise.resolve();

  function database(): Promise<SqliteDatabaseLike> {
    ready ??= (async () => {
      const db = await open();
      await migrateWalletDatabase(db);
      return db;
    })().catch((error: unknown) => {
      ready = null;
      throw error;
    });
    return ready;
  }

  function serial<T>(operation: (db: SqliteDatabaseLike) => Promise<T>): Promise<T> {
    const run = tail.then(async () => {
      try {
        return await operation(await database());
      } catch (error) {
        throw error instanceof WalletDatabaseError ? error : new WalletDatabaseError('QUERY_FAILED');
      }
    });
    tail = run.catch(() => undefined);
    return run;
  }

  return {
    insert: (row) =>
      serial(async (db) => {
        await db.runAsync(`INSERT INTO credentials (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
          row.id,
          row.vct,
          row.issuer,
          row.key_id,
          row.ciphertext,
          row.status_cache,
          row.status_checked_at,
          row.created_at,
        ]);
      }),
    list: () => serial((db) => db.getAllAsync<CredentialRow>(`SELECT ${COLUMNS} FROM credentials ORDER BY created_at, id`, [])),
    get: (id) => serial((db) => db.getFirstAsync<CredentialRow>(`SELECT ${COLUMNS} FROM credentials WHERE id = ?`, [id])),
    update: (id, patch) =>
      serial(async (db) => {
        await db.runAsync('UPDATE credentials SET status_cache = ?, status_checked_at = ? WHERE id = ?', [
          patch.status_cache,
          patch.status_checked_at,
          id,
        ]);
      }),
    delete: (id) =>
      serial(async (db) => {
        await db.runAsync('DELETE FROM credentials WHERE id = ?', [id]);
      }),
  };
}
