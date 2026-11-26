// DEV ONLY: a scripted in-memory WalletApi for rendering the wallet screens on web for review
// (EXPO_PUBLIC_WALLET_HARNESS=1 with a --dev export, see docs/runbooks/wallet-screen-review.md).
// Reached only through the `identra-wallet-harness` alias, which metro.config.js points here only
// when that variable is set; `npm run check:bundle` fails if any of it reaches a release bundle.
//
// Scenario (localStorage 'identra.harness.scenario'): empty | held | did | restored | catalogue | broken.
// `did`: one X.509 document (h1) beside five of the DID trust path (ADR-0020): d1 valid (the gateway's
// usual 16-character identifier), d2 not checked yet (CertNet's registry did not answer at the last
// check), d3 issuer no longer recognised, d4 not checked because this build has no CertNet
// configuration ("Kiểm tra lại" says so), d5 valid with a 64-character identifier.
// QR text containing "expired" / "offline" / "invalid" / "unsupported" (a CertNet issuer, no CertNet in this build) fails resolve accordingly; containing "did" it
// is an offer from a DID issuer ("longdid": with the 64-character identifier; "testdid": a test-network one). PIN 000000 is wrong, 111111 gives a credential that fails its
// checks, 222222 an expired offer, 333333 no answer to the PIN (code not redeemed), 444444 a
// cancelled prompt and 555555 no network after the PIN was accepted (both resumable), 666666 (DID
// offer) a received credential whose issuer CertNet could not resolve (resumable without the PIN).
// "Kiểm tra lại" on d2 / d3 answers with the checks of that state.
// Presentation QR (localStorage 'identra.harness.presentation') containing: untrusted, two-docs, did-doc, long-did, mixed-docs,
// revoked, invalid-doc, three-sets, nomatch, short (expires in 4 s), or a code (CERT_CHAIN_UNTRUSTED, CLIENT_ID_MISMATCH,
// SIGNATURE_INVALID, REQUEST_INVALID, REQUEST_EXPIRED, TRUST_LIST_UNAVAILABLE, URL_NOT_ALLOWED) to fail
// resolve. Submit outcome: localStorage 'identra.harness.submit' (ok or a wallet code; a comma list answers
// the sends of one request in turn, e.g. "DID_RESOLUTION_UNAVAILABLE,ok"). DID_RESOLUTION_UNAVAILABLE is the
// SDK's "the verifier received it but could not reach CertNet" (`delivered`); like the SDK, the request is
// then pinned to that choice per QR (a later resolve of the same QR, in this page, returns `pinned`), the
// third send of a request is VERIFIER_ERROR and a resolve after it is REQUEST_INVALID.
import type { AcceptResult, CredentialDetails, ResolvedOffer, ResolvedPresentation } from '@identra/sdk-app';
import { VCT, type Check } from '@identra/sdk-core';

import type { WalletApi, WalletCredentialSummary } from '../domain/wallet/walletContainer';
import type { WalletHarness } from '../platform/harnessDisabled';

const ISS = 'https://api-identra.awncorp.vn/issuers/truong-mau';
const DID_ISS = 'https://api-identra.awncorp.vn/issuers/truong-did';
const DID_MAIN = 'did:certnet:mainnet:5e8a1c9f03b7d246';
// 64 characters with no place to break a line: the worst case for wrapping.
const DID_LONG = 'did:certnet:mainnet:truongdaihocbachkhoahanoi0f3a9c4be17d52806ad4e9b1c37f5a28e0b6d49';
const DID_TEST = 'did:certnet:testnet:7Hq2xKpL9mN4vR8sT1wZ3bQ6';
const X509 = { trustPath: 'x509', issuerDid: null } as const;
const didPath = (issuerDid: string) => ({ trustPath: 'did', issuerDid, issuerUri: DID_ISS, issuerName: null }) as const;
const ok = (id: Check['id']): Check => ({ id, ok: true, code: null });
const skipped = (id: Check['id']): Check => ({ id, ok: false, code: 'SKIPPED', skipped: true });
/** What "Kiểm tra lại" answers for the DID-path documents (the SDK's checks of that state). */
const DID_REFRESH: Record<string, Check[]> = {
  d2: [ok('structure'), ok('algorithm'), ok('did_resolution'), ok('signature'), ok('validity_time'), ok('credential_type'), { id: 'issuer_trust', ok: false, code: 'TRUST_LIST_UNAVAILABLE' }, skipped('status')],
  d3: [ok('structure'), ok('algorithm'), ok('did_resolution'), ok('signature'), ok('validity_time'), ok('credential_type'), { id: 'issuer_trust', ok: false, code: 'ISSUER_NOT_TRUSTED' }, skipped('status')],
  // A build without CertNet configuration: nothing was asked of CertNet (the SDK says unknown, not invalid).
  d4: [ok('structure'), ok('algorithm'), { id: 'did_resolution', ok: false, code: 'DID_RESOLUTION_FAILED' }, skipped('signature')],
};
const CLAIMS = {
  ho_ten: 'Nguyễn Thị Minh Anh',
  ngay_sinh: '2002-09-14',
  ma_sinh_vien: 'TM20240117',
  nganh: 'Khoa học máy tính',
  hang_tot_nghiep: 'Giỏi',
  nam_tot_nghiep: '2024',
  so_hieu_bang: 'TM-2024-004512',
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const scenario = (): string => (globalThis as { localStorage?: Storage }).localStorage?.getItem('identra.harness.scenario') ?? 'held';

let instance: WalletApi | null = null;

export function getHarnessWallet(): WalletApi {
  if (instance) return instance;
  const held = new Map<string, WalletCredentialSummary>();
  if (scenario() === 'held' || scenario() === 'broken') {
    held.set('h1', { id: 'h1', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', ...X509, status: 'valid', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-11-18T09:30:00Z' });
    held.set('h2', { id: 'h2', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', ...X509, status: 'unknown', statusCheckedAt: '2026-11-10T02:10:00Z', createdAt: '2026-11-02T09:30:00Z' });
    held.set('h4', { id: 'h4', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', ...X509, status: 'invalid', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-09-01T09:30:00Z' });
    held.set('h3', { id: 'h3', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', ...X509, status: 'revoked', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-10-21T09:30:00Z' });
  }
  if (scenario() === 'did') {
    held.set('h1', { id: 'h1', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', ...X509, status: 'valid', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-11-18T09:30:00Z' });
    held.set('d1', { id: 'd1', vct: VCT.diploma, ...didPath(DID_MAIN), status: 'valid', statusCheckedAt: '2026-11-25T02:10:00Z', createdAt: '2026-11-24T09:30:00Z' });
    held.set('d2', { id: 'd2', vct: VCT.diploma, ...didPath(DID_TEST), status: 'unknown', statusCheckedAt: '2026-11-22T02:10:00Z', createdAt: '2026-11-21T09:30:00Z' });
    held.set('d3', { id: 'd3', vct: VCT.diploma, ...didPath(DID_MAIN), status: 'invalid', statusCheckedAt: '2026-11-25T02:10:00Z', createdAt: '2026-11-20T09:30:00Z' });
    held.set('d4', { id: 'd4', vct: VCT.diploma, ...didPath(DID_MAIN), status: 'unknown', statusCheckedAt: '2026-11-23T02:10:00Z', createdAt: '2026-11-19T09:30:00Z' });
    held.set('d5', { id: 'd5', vct: VCT.diploma, ...didPath(DID_LONG), status: 'valid', statusCheckedAt: '2026-11-25T02:10:00Z', createdAt: '2026-11-25T09:30:00Z' });
  }
  const pendingDid = new Set<ResolvedOffer>();
  const offer: ResolvedOffer = {
    issuerUri: ISS,
    issuerOrigin: 'https://api-identra.awncorp.vn',
    issuerDid: null,
    issuerDisplay: [{ name: 'Trường Đại học Mẫu', locale: 'vi' }, { name: 'Sample University', locale: 'en' }],
    configuration: { id: 'bang-tot-nghiep-v1', vct: VCT.diploma, display: [{ name: 'Bằng tốt nghiệp', locale: 'vi' }] },
    txCode: { length: 6, inputMode: 'numeric', description: null },
    codeRedeemed: false,
  };
  // Its self-declared name stays in issuerDisplay on purpose: the receive screen must not show it.
  const didOffer: ResolvedOffer = { ...offer, issuerUri: DID_ISS, issuerDid: DID_MAIN, codeRedeemed: false };
  const longDidOffer: ResolvedOffer = { ...didOffer, issuerDid: DID_LONG };
  const testDidOffer: ResolvedOffer = { ...didOffer, issuerDid: DID_TEST };
  // Like the SDK: per QR (the request), not per resolved object.
  const qrOf = new Map<ResolvedPresentation, string>();
  const sends = new Map<string, number>();
  const pins = new Map<string, { credentialId: string; claimSetIndex: number }>();
  const sets = [
    { index: 0, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep'] },
    { index: 1, claims: ['ho_ten', 'nganh'] },
  ];
  const threeSets = [
    { index: 0, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep'] },
    { index: 1, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep'] },
    { index: 2, claims: ['ho_ten', 'nganh'] },
  ];
  // `codeRedeemed` is the SDK field being added (not yet in its AcceptResult type).
  const acceptFailure = (code: string, retryable: boolean, codeRedeemed: boolean, extra: object = {}) => ({ ok: false, code, retryable, codeRedeemed, ...extra }) as AcceptResult;
  const presentationCodes = ['CERT_CHAIN_UNTRUSTED', 'CLIENT_ID_MISMATCH', 'SIGNATURE_INVALID', 'REQUEST_INVALID', 'REQUEST_EXPIRED', 'TRUST_LIST_UNAVAILABLE', 'URL_NOT_ALLOWED'] as const;
  const catalogueItems = [{ vct: VCT.diploma, issuer: ISS }, { vct: VCT.diploma, issuer: 'https://dai-hoc-khac.example.vn/issuers/dhk' }];

  const api: WalletApi = {
    offers: {
      async resolve(qr) {
        await wait(700);
        if (qr.includes('expired')) return { ok: false, code: 'OFFER_EXPIRED' };
        if (qr.includes('offline')) return { ok: false, code: 'NETWORK_ERROR' };
        if (qr.includes('invalid')) return { ok: false, code: 'OFFER_INVALID' };
        if (qr.includes('unsupported')) return { ok: false, code: 'TRUST_PATH_UNSUPPORTED' };
        return { ok: true, offer: qr.includes('longdid') ? longDidOffer : qr.includes('testdid') ? testDidOffer : qr.includes('did') ? didOffer : offer };
      },
      async discard(o) {
        pendingDid.delete(o);
      },
      async accept(o, { txCode }) {
        await wait(900);
        if (o.issuerUri === DID_ISS) {
          // The credential arrived; CertNet could not resolve its issuer: nothing stored, the next accept verifies it again.
          if (txCode === '666666') {
            pendingDid.add(o);
            return acceptFailure('NETWORK_ERROR', true, true, { checks: [ok('structure'), ok('algorithm'), { id: 'did_resolution', ok: false, code: 'DID_RESOLUTION_UNAVAILABLE' }, skipped('signature')] });
          }
          if (txCode !== undefined || pendingDid.delete(o)) {
            const id = `r${held.size + 1}`;
            const did = o.issuerDid ?? DID_MAIN;
            held.set(id, { id, vct: VCT.diploma, ...didPath(did), status: 'valid', statusCheckedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
            return { ok: true, credentialId: id, vct: VCT.diploma, issuerName: null, issuerDid: did, status: 'valid' };
          }
        }
        if (txCode === '000000') return acceptFailure('TX_CODE_WRONG', true, false);
        if (txCode === '111111') return acceptFailure('CREDENTIAL_INVALID', false, true, { checks: [{ id: 'signature', ok: true, code: null }, { id: 'issuer_trust', ok: false, code: 'ISSUER_NOT_TRUSTED' }] });
        if (txCode === '222222') return acceptFailure('OFFER_EXPIRED', false, false);
        if (txCode === '333333') return acceptFailure('NETWORK_ERROR', true, false);
        // 444444 / 555555: after the PIN was accepted; the SDK can resume (txCode is then undefined).
        if (txCode === '444444') return acceptFailure('USER_CANCELLED', true, true);
        if (txCode === '555555') return acceptFailure('NETWORK_ERROR', true, true);
        const id = `r${held.size + 1}`;
        held.set(id, { id, vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', ...X509, status: 'valid', statusCheckedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
        return { ok: true, credentialId: id, vct: VCT.diploma, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'valid' };
      },
    },
    presentations: {
      async resolve(qr) {
        await wait(700);
        const code = presentationCodes.find((c) => qr.includes(c));
        if (code) return { ok: false, code };
        const pin = pins.get(qr);
        if (pin && (sends.get(qr) ?? 0) >= 3) return { ok: false, code: 'REQUEST_INVALID' };
        const untrusted = qr.includes('untrusted');
        const ids = qr.includes('nomatch') ? [] : qr.includes('mixed-docs') ? ['h1', 'd1'] : qr.includes('did-doc') ? ['d1'] : qr.includes('long-did') ? ['d5'] : qr.includes('two-docs') ? ['h1', 'h2'] : qr.includes('revoked') ? ['h3'] : qr.includes('invalid-doc') ? ['h4'] : ['h1'];
        const request: ResolvedPresentation = {
          clientId: 'x509_hash:harness',
          verifier: untrusted ? { trusted: false } : { trusted: true, ten: 'Nhà tuyển dụng Mẫu (DEMO)', maToChuc: 'VATVN-0100000005' },
          ...(untrusted ? { warning: 'VERIFIER_NOT_TRUSTED' as const } : { purpose: { vi: 'Ứng tuyển vị trí kỹ sư phần mềm', en: 'Job application: software engineer' } }),
          matches: ids.map((id) => {
            const h = held.get(id);
            const path = h?.trustPath === 'did' ? { trustPath: 'did' as const, issuerDid: h.issuerDid, issuerName: null } : { ...X509, issuerName: 'Trường Đại học Mẫu (DEMO)' };
            return { credentialId: id, vct: VCT.diploma, ...path, claimSets: qr.includes('three-sets') ? threeSets : sets };
          }),
          expiresAt: new Date(Date.now() + (qr.includes('short') ? 4000 : 272000)).toISOString(),
          pinned: pin ? { ...pin, sends: sends.get(qr) ?? 0 } : null,
        };
        qrOf.set(request, qr);
        return { ok: true, request };
      },
      async submit(request, choice) {
        await wait(1200);
        const qr = qrOf.get(request) ?? '';
        const pin = pins.get(qr);
        if (pin && (pin.credentialId !== choice.credentialId || pin.claimSetIndex !== choice.claimSetIndex)) return { ok: false, code: 'REQUEST_INVALID' };
        const n = (sends.get(qr) ?? 0) + 1;
        sends.set(qr, n);
        const answers = (localStorage.getItem('identra.harness.submit') ?? 'ok').split(',');
        const outcome = answers[Math.min(n, answers.length) - 1]!;
        if (outcome === 'ok') return { ok: true };
        if (outcome === 'DID_RESOLUTION_UNAVAILABLE' && n < 3) pins.set(qr, { credentialId: choice.credentialId, claimSetIndex: choice.claimSetIndex });
        if (outcome === 'DID_RESOLUTION_UNAVAILABLE') return n < 3 ? { ok: false, code: outcome, delivered: true } : { ok: false, code: 'VERIFIER_ERROR' };
        return { ok: false, code: outcome as 'VERIFIER_ERROR' };
      },
      decline: () => ({ ok: true }),
    },
    credentials: {
      async list() {
        await wait(300);
        return [...held.values()];
      },
      async get(id) {
        await wait(400);
        const s = held.get(id);
        if (!s) return { ok: false, code: 'CREDENTIAL_NOT_FOUND' };
        const credential: CredentialDetails = { ...s, issuerName: s.issuerName, iat: Date.parse(s.createdAt) / 1000, claims: CLAIMS };
        return { ok: true, credential };
      },
      async refreshStatus(id) {
        await wait(800);
        const s = held.get(id);
        if (!s) return { ok: false, code: 'CREDENTIAL_NOT_FOUND' };
        if (scenario() === 'broken') return { ok: false, code: 'NETWORK_ERROR' };
        const checkedAt = new Date().toISOString();
        held.set(id, { ...s, statusCheckedAt: checkedAt });
        return { ok: true, status: s.status ?? 'unknown', checks: DID_REFRESH[id] ?? [], checkedAt, lastValidAt: s.status === 'valid' ? checkedAt : null };
      },
      async remove(id) {
        await wait(400);
        held.delete(id);
        return { ok: true };
      },
    },
    async getStartupState() {
      await wait(300);
      if (scenario() === 'broken') throw Object.assign(new Error('locked'), { code: 'LOCKED' });
      if (scenario() === 'restored') return { kind: 'restored-device', unreadableCount: 2, toRequest: catalogueItems };
      if (scenario() === 'catalogue') return { kind: 'ready', credentialCount: 0, toRequest: catalogueItems };
      return { kind: 'ready', credentialCount: held.size, toRequest: [] };
    },
    async acknowledgeNewDevice() {
      await wait(600);
      localStorage.setItem('identra.harness.scenario', 'catalogue');
    },
    async forgetDocument() {
      await wait(200);
    },
  };
  instance = api;
  return api;
}

export const harness: WalletHarness = {
  wallet: getHarnessWallet,
  keyProtectionReady: () => (globalThis as { localStorage?: Storage }).localStorage?.getItem('identra.harness.biometrics') !== 'off',
  pending: (kind) => (globalThis as { localStorage?: Storage }).localStorage?.getItem(`identra.harness.${kind}`) ?? null,
};
