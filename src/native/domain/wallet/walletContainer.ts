// The wallet container (ADR-0009): wires the platform adapters into the SDK behind the small
// interface the issuance and presentation screens use. Pure TypeScript: every platform piece is
// injected, so Node tests run it with fakes and walletRuntime.ts wires the Expo modules.
import {
  buildCatalogue,
  createCredentialVault,
  createWallet as createSdkWallet,
  createSoftwareKeyStore,
  diffCatalogue,
  mergeCatalogue,
  nobleHasher,
  nobleVerifier,
  parseCatalogue,
  serializeCatalogue,
  type Catalogue,
  type AcceptResult,
  type CatalogueItem,
  type CredentialDetails,
  type CredentialRepository,
  type CredentialSummary,
  type CredentialVault,
  type ResolvedOffer,
  type SecretStorage,
  type WalletFailure,
  type WalletKeyStore,
} from '@identra/sdk-app';
import { base64Decode, VCT, type Clock, type Hasher, type HttpFetch, type RandomSource, type SeenStore, type Verifier } from '@identra/sdk-core';

import { PINNED_ROOT_CERTIFICATES_BASE64 } from './pinnedRoots';

/** The backed-up catalogue file (ADR-0009 §5). Same name as plugins/withIdentraBackupRules.js. */
export const CATALOGUE_FILE_NAME = 'identra-backup-catalogue.json';

export interface CatalogueFile {
  /** null when the file does not exist. */
  read(): Promise<string | null>;
  write(text: string): Promise<void>;
}

/** The signed trust list every issuer and status list is checked against (ADR-0013 §6). */
export const TRUST_LIST_URL = 'https://api-identra.awncorp.vn/trust-list';
/** The only origin wallet QR codes may point to (ADR-0010 §6); a development build maps it to a local server. */
export const IDENTRA_API_ORIGIN = 'https://api-identra.awncorp.vn';
/** What this wallet can receive today. */
export const SUPPORTED_VCTS: readonly string[] = [VCT.diploma];
const ISSUER_NAMES_KEY = 'identra.wallet.issuer-names.v1';

export function pinnedRoots(): Uint8Array[] {
  return PINNED_ROOT_CERTIFICATES_BASE64.map((b64) => base64Decode(b64));
}

/** AsyncStorage-shaped storage for small non-secret data (issuer display names). */
export interface PlainStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
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
  plainStorage: PlainStorage;
  /** Defaults to the pinned Identra roots; tests pass the SDK's test root. */
  trustedRoots?: Uint8Array[];
  trustListUrl?: string;
}

/** A held credential as the list shows it: the SDK summary plus the issuer name last seen for it. */
export interface WalletCredentialSummary extends CredentialSummary {
  /** The trusted organisation name from the last receipt or opening; null when never seen. */
  issuerName: string | null;
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
  /** OpenID4VCI (SDK wallet object). */
  readonly offers: {
    resolve(qrText: string): Promise<{ ok: true; offer: ResolvedOffer } | WalletFailure>;
    /** Resumable: after a `retryable` failure, call again with the same offer (the PIN is then ignored). */
    accept(offer: ResolvedOffer, input: { txCode?: string }): Promise<AcceptResult>;
    /** The person abandoned the offer: forget its token and any key waiting for a retried save. */
    discard(offer: ResolvedOffer): Promise<void>;
  };
  /** OpenID4VP (SDK wallet object): resolve / submit / decline. */
  readonly presentations: ReturnType<typeof createSdkWallet>['presentations'];
  readonly credentials: {
    list(): Promise<WalletCredentialSummary[]>;
    get(id: string): Promise<{ ok: true; credential: CredentialDetails } | WalletFailure>;
    refreshStatus(id: string): ReturnType<ReturnType<typeof createSdkWallet>['credentials']['refreshStatus']>;
    remove(id: string): Promise<{ ok: true } | WalletFailure>;
  };
  getStartupState(): Promise<WalletStartupState>;
  /** Deletes the unreadable rows of a restored phone; only after the user confirmed it. */
  acknowledgeNewDevice(): Promise<void>;
  /** The user no longer wants a document listed for re-issuance. */
  forgetDocument(item: CatalogueItem): Promise<void>;
}

/** What the screens use; a dev harness implements the same shape with scripted answers. */
export type WalletApi = Pick<Wallet, 'offers' | 'presentations' | 'credentials' | 'getStartupState' | 'acknowledgeNewDevice' | 'forgetDocument'>;

/** The SDK's mergeCatalogue, also for a phone with no catalogue file yet. */
export function nextCatalogue(previous: Catalogue | null, rows: readonly CatalogueItem[], dropped: readonly CatalogueItem[] = []): Catalogue {
  return mergeCatalogue(previous ?? { version: 1, items: [] }, rows, dropped);
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
    const row = await inner.getMeta(id);
    return row ? [{ vct: row.vct, issuer: row.issuer }] : [];
  }

  const vault: CredentialVault = {
    async save(input) {
      const id = await inner.save(input);
      await syncCatalogue();
      return id;
    },
    list: () => inner.list(),
    getMeta: (id) => inner.getMeta(id),
    dataKeyState: () => inner.dataKeyState(),
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
    return rows.length > 0 && (await inner.dataKeyState()) === 'missing';
  }

  const sdk = createSdkWallet({
    keyStore,
    vault,
    fetch: deps.fetch,
    random,
    clock,
    trustedRoots: deps.trustedRoots ?? pinnedRoots(),
    trustListUrl: deps.trustListUrl ?? TRUST_LIST_URL,
    supportedVcts: [...SUPPORTED_VCTS],
    seen: deps.seen,
    allowedOrigins: [IDENTRA_API_ORIGIN],
  });

  async function issuerNames(): Promise<Record<string, string>> {
    try {
      const parsed: unknown = JSON.parse((await deps.plainStorage.getItem(ISSUER_NAMES_KEY)) ?? '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {};
    } catch {
      return {};
    }
  }
  /** Best effort: a name that cannot be saved is shown again after the next opening. */
  async function rememberIssuerName(issuerUri: string, name: string | null): Promise<void> {
    if (!name) return;
    const names = await issuerNames();
    if (names[issuerUri] === name) return;
    await deps.plainStorage.setItem(ISSUER_NAMES_KEY, JSON.stringify({ ...names, [issuerUri]: name })).catch(() => undefined);
  }

  return {
    keyStore,
    vault,
    offers: {
      resolve: (qrText) => sdk.offers.resolve(qrText),
      discard: (offer) => sdk.offers.discard(offer),
      async accept(offer, input) {
        const result = await sdk.offers.accept(offer, input);
        if (result.ok) await rememberIssuerName(offer.issuerUri, result.issuerName);
        return result;
      },
    },
    presentations: sdk.presentations,
    credentials: {
      async list() {
        const [summaries, names] = await Promise.all([sdk.credentials.list(), issuerNames()]);
        return summaries.map((c) => ({ ...c, issuerName: names[c.issuerUri] ?? null }));
      },
      async get(id) {
        const result = await sdk.credentials.get(id);
        if (result.ok) await rememberIssuerName(result.credential.issuerUri, result.credential.issuerName);
        return result;
      },
      refreshStatus: (id) => sdk.credentials.refreshStatus(id),
      remove: (id) => sdk.credentials.remove(id),
    },
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
