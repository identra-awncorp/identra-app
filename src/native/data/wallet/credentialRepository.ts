import { CREDENTIALS_TABLE_DDL, type CredentialRepository, type CredentialRow } from '@identra/sdk-app';

export const WALLET_DATABASE_NAME = 'identra-wallet.db';
export const WALLET_SCHEMA_VERSION = 1;

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

/** Brings the schema to WALLET_SCHEMA_VERSION; PRAGMA user_version holds the version. */
export async function migrateWalletDatabase(db: SqliteDatabaseLike): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  const version = row?.user_version ?? 0;
  if (version > WALLET_SCHEMA_VERSION) throw new WalletDatabaseError('SCHEMA_TOO_NEW');
  if (version < 1) {
    // The DDL is IF NOT EXISTS, so a crash between the two statements is repaired on the next start.
    await db.execAsync(`${CREDENTIALS_TABLE_DDL};\nPRAGMA user_version = 1;`);
  }
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
