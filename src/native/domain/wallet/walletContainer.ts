// The wallet container (ADR-0009): wires the platform adapters into the SDK behind the small
// interface the issuance and presentation screens use. Pure TypeScript: every platform piece is
// injected, so Node tests run it with fakes and walletRuntime.ts wires the Expo modules.
import {
  buildCatalogue,
  createCredentialVault,
  createSoftwareKeyStore,
  DATA_KEY_NAME,
  diffCatalogue,
  nobleHasher,
  nobleVerifier,
  parseCatalogue,
  serializeCatalogue,
  type Catalogue,
  type CatalogueItem,
  type CredentialRepository,
  type CredentialVault,
  type SecretStorage,
  type WalletKeyStore,
} from '@identra/sdk-app';
import type { Clock, Hasher, HttpFetch, RandomSource, SeenStore, Verifier } from '@identra/sdk-core';

/** The backed-up catalogue file (ADR-0009 §5). Same name as plugins/withIdentraBackupRules.js. */
export const CATALOGUE_FILE_NAME = 'identra-backup-catalogue.json';

export interface CatalogueFile {
  /** null when the file does not exist. */
  read(): Promise<string | null>;
  write(text: string): Promise<void>;
}

export interface WalletDependencies {
  random: RandomSource;
  clock: Clock;
  fetch: HttpFetch;
  seen: SeenStore;
  keySecrets: SecretStorage;
  dataKeySecrets: SecretStorage;
  repository: CredentialRepository;
  catalogueFile: CatalogueFile;
}

export type WalletStartupState =
  /** Normal start. `toRequest`: catalogue documents this wallet does not hold (fresh install restored from a backup). */
  | { kind: 'ready'; credentialCount: number; toRequest: CatalogueItem[] }
  /**
   * Rows exist but the device-only data key does not: a phone restored from a backup that carried
   * the database. Nothing is deleted until the user confirms with acknowledgeNewDevice().
   */
  | { kind: 'restored-device'; unreadableCount: number; toRequest: CatalogueItem[] };

export class WalletStateError extends Error {
  readonly code = 'NOT_A_RESTORED_DEVICE' as const;
  constructor() {
    super('the wallet is not in the restored-device state');
    this.name = 'WalletStateError';
  }
}

export interface Wallet {
  readonly keyStore: WalletKeyStore;
  /** The SDK vault; every change also updates the backed-up catalogue. */
  readonly vault: CredentialVault;
  readonly random: RandomSource;
  readonly clock: Clock;
  readonly fetch: HttpFetch;
  readonly seen: SeenStore;
  readonly verifier: Verifier;
  readonly hasher: Hasher;
  getStartupState(): Promise<WalletStartupState>;
  /** Deletes the unreadable rows of a restored phone; only after the user confirmed it. */
  acknowledgeNewDevice(): Promise<void>;
  /** The user no longer wants a document listed for re-issuance. */
  forgetDocument(item: CatalogueItem): Promise<void>;
}

const itemKey = (i: CatalogueItem): string => JSON.stringify([i.vct, i.issuer]);

/**
 * The next catalogue: everything the previous one listed plus every held document, minus the
 * `dropped` items that no row holds any more. Not just buildCatalogue(rows): on a restored phone
 * the first re-issued document would otherwise erase the rest of the list to request again.
 */
export function nextCatalogue(previous: Catalogue | null, rows: readonly CatalogueItem[], dropped: readonly CatalogueItem[] = []): Catalogue {
  const held = new Set(rows.map(itemKey));
  const droppedKeys = new Set(dropped.map(itemKey));
  const carried = (previous?.items ?? []).filter((i) => held.has(itemKey(i)) || !droppedKeys.has(itemKey(i)));
  return buildCatalogue([...carried, ...rows]);
}

export function createWallet(deps: WalletDependencies): Wallet {
  const { random, clock, repository, catalogueFile, dataKeySecrets } = deps;
  const keyStore = createSoftwareKeyStore({ secrets: deps.keySecrets, random });
  const inner = createCredentialVault({ repository, secrets: dataKeySecrets, random, clock });

  let catalogueTail: Promise<void> = Promise.resolve();
  let catalogueStale = false;

  async function readCatalogue(): Promise<Catalogue | null> {
    const text = await catalogueFile.read();
    return text === null ? null : parseCatalogue(text);
  }

  /** Serialised; a failed write never fails the vault change, it is retried on the next change or start. */
  function syncCatalogue(dropped: readonly CatalogueItem[] = []): Promise<void> {
    catalogueTail = catalogueTail.then(async () => {
      try {
        const next = nextCatalogue(await readCatalogue(), await inner.list(), dropped);
        await catalogueFile.write(serializeCatalogue(next));
        catalogueStale = false;
      } catch {
        // ponytail: no surfaced error; a stale catalogue is retried, the vault change already stands.
        catalogueStale = true;
      }
    });
    return catalogueTail;
  }

  async function itemOf(id: string): Promise<CatalogueItem[]> {
    const row = (await inner.list()).find((r) => r.id === id);
    return row ? [{ vct: row.vct, issuer: row.issuer }] : [];
  }

  const vault: CredentialVault = {
    async save(input) {
      const id = await inner.save(input);
      await syncCatalogue();
      return id;
    },
    list: () => inner.list(),
    open: (id) => inner.open(id),
    async remove(id) {
      const dropped = await itemOf(id);
      await inner.remove(id);
      await syncCatalogue(dropped);
    },
    async removeWithKey(id, store) {
      const dropped = await itemOf(id);
      await inner.removeWithKey(id, store);
      await syncCatalogue(dropped);
    },
    async purgeUndecryptable() {
      const result = await inner.purgeUndecryptable();
      // The purged documents stay in the catalogue: they are exactly the ones to request again.
      await syncCatalogue();
      return result;
    },
    // Rows go, the catalogue stays: it is the list of documents to request again.
    resetForNewDevice: () => inner.resetForNewDevice(),
    setStatus: (id, status, checkedAt) => inner.setStatus(id, status, checkedAt),
  };

  async function isRestoredDevice(rows: readonly unknown[]): Promise<boolean> {
    return rows.length > 0 && (await dataKeySecrets.get(DATA_KEY_NAME)) === null;
  }

  return {
    keyStore,
    vault,
    random,
    clock,
    fetch: deps.fetch,
    seen: deps.seen,
    verifier: nobleVerifier,
    hasher: nobleHasher,

    async getStartupState() {
      const rows = await inner.list();
      const catalogue = await readCatalogue();
      if (await isRestoredDevice(rows)) {
        // Rows keep vct and issuer in clear, so they name the documents even without a catalogue.
        return { kind: 'restored-device', unreadableCount: rows.length, toRequest: buildCatalogue([...(catalogue?.items ?? []), ...rows]).items };
      }
      if (catalogueStale || rows.length > 0) await syncCatalogue();
      return { kind: 'ready', credentialCount: rows.length, toRequest: catalogue ? diffCatalogue(catalogue, rows) : [] };
    },

    async acknowledgeNewDevice() {
      const rows = await inner.list();
      if (!(await isRestoredDevice(rows))) throw new WalletStateError();
      // Keep every document of the dead rows listed before the rows go.
      await catalogueFile.write(serializeCatalogue(nextCatalogue(await readCatalogue(), rows)));
      await inner.resetForNewDevice();
    },

    async forgetDocument(item) {
      await syncCatalogue([item]);
    },
  };
}
