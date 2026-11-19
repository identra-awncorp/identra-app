// DEV ONLY: a scripted in-memory WalletApi for rendering the wallet screens on web for review
// (EXPO_PUBLIC_WALLET_HARNESS=1 with a --dev export, see docs/runbooks/wallet-screen-review.md).
// Reached only through the `identra-wallet-harness` alias, which metro.config.js points here only
// when that variable is set; `npm run check:bundle` fails if any of it reaches a release bundle.
//
// Scenario (localStorage 'identra.harness.scenario'): empty | held | restored | catalogue | broken.
// QR text containing "expired" / "offline" / "invalid" fails resolve accordingly. PIN 000000 is
// wrong, 111111 gives a credential that fails its checks, 222222 an expired offer, 333333 no network.
// Presentation QR (localStorage 'identra.harness.presentation') containing: untrusted, two-docs,
// revoked, nomatch, short (expires in 4 s), or a code (CERT_CHAIN_UNTRUSTED, CLIENT_ID_MISMATCH,
// SIGNATURE_INVALID, REQUEST_INVALID, REQUEST_EXPIRED, TRUST_LIST_UNAVAILABLE, URL_NOT_ALLOWED) to fail
// resolve. Submit outcome: localStorage 'identra.harness.submit' (ok or a wallet code).
import type { CredentialDetails, ResolvedOffer, ResolvedPresentation } from '@identra/sdk-app';
import { VCT } from '@identra/sdk-core';

import type { WalletApi, WalletCredentialSummary } from '../domain/wallet/walletContainer';
import type { WalletHarness } from '../platform/harnessDisabled';

const ISS = 'https://api-identra.awncorp.vn/issuers/truong-mau';
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
    held.set('h1', { id: 'h1', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'valid', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-11-18T09:30:00Z' });
    held.set('h2', { id: 'h2', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'unknown', statusCheckedAt: '2026-11-10T02:10:00Z', createdAt: '2026-11-02T09:30:00Z' });
    held.set('h4', { id: 'h4', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'invalid', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-09-01T09:30:00Z' });
    held.set('h3', { id: 'h3', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'revoked', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-10-21T09:30:00Z' });
  }
  const offer: ResolvedOffer = {
    issuerUri: ISS,
    issuerOrigin: 'https://api-identra.awncorp.vn',
    issuerDisplay: [{ name: 'Trường Đại học Mẫu', locale: 'vi' }, { name: 'Sample University', locale: 'en' }],
    configuration: { id: 'bang-tot-nghiep-v1', vct: VCT.diploma, display: [{ name: 'Bằng tốt nghiệp', locale: 'vi' }] },
    txCode: { length: 6, inputMode: 'numeric', description: null },
  };
  const sets = [
    { index: 0, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep'] },
    { index: 1, claims: ['ho_ten', 'nganh'] },
  ];
  const presentationCodes = ['CERT_CHAIN_UNTRUSTED', 'CLIENT_ID_MISMATCH', 'SIGNATURE_INVALID', 'REQUEST_INVALID', 'REQUEST_EXPIRED', 'TRUST_LIST_UNAVAILABLE', 'URL_NOT_ALLOWED'] as const;
  const catalogueItems = [{ vct: VCT.diploma, issuer: ISS }, { vct: VCT.diploma, issuer: 'https://dai-hoc-khac.example.vn/issuers/dhk' }];

  const api: WalletApi = {
    offers: {
      async resolve(qr) {
        await wait(700);
        if (qr.includes('expired')) return { ok: false, code: 'OFFER_EXPIRED' };
        if (qr.includes('offline')) return { ok: false, code: 'NETWORK_ERROR' };
        if (qr.includes('invalid')) return { ok: false, code: 'OFFER_INVALID' };
        return { ok: true, offer };
      },
      async discard() {},
      async accept(_offer, { txCode }) {
        await wait(900);
        if (txCode === '000000') return { ok: false, code: 'TX_CODE_WRONG', retryable: true };
        if (txCode === '111111') return { ok: false, code: 'CREDENTIAL_INVALID', retryable: false, checks: [{ id: 'signature', ok: true, code: null }, { id: 'issuer_trust', ok: false, code: 'ISSUER_NOT_TRUSTED' }] };
        if (txCode === '222222') return { ok: false, code: 'OFFER_EXPIRED', retryable: false };
        if (txCode === '333333') return { ok: false, code: 'NETWORK_ERROR', retryable: false };
        // 444444: the biometric prompt was cancelled after the PIN; the SDK can resume (txCode is then undefined).
        if (txCode === '444444') return { ok: false, code: 'USER_CANCELLED', retryable: true };
        const id = `r${held.size + 1}`;
        held.set(id, { id, vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'valid', statusCheckedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
        return { ok: true, credentialId: id, vct: VCT.diploma, issuerName: 'Trường Đại học Mẫu (DEMO)', status: 'valid' };
      },
    },
    presentations: {
      async resolve(qr) {
        await wait(700);
        const code = presentationCodes.find((c) => qr.includes(c));
        if (code) return { ok: false, code };
        const untrusted = qr.includes('untrusted');
        const ids = qr.includes('nomatch') ? [] : qr.includes('two-docs') ? ['h1', 'h2'] : qr.includes('revoked') ? ['h3'] : ['h1'];
        const request: ResolvedPresentation = {
          clientId: 'x509_hash:harness',
          verifier: untrusted ? { trusted: false } : { trusted: true, ten: 'Nhà tuyển dụng Mẫu (DEMO)', maToChuc: 'VATVN-0100000005' },
          ...(untrusted ? { warning: 'VERIFIER_NOT_TRUSTED' as const } : { purpose: { vi: 'Ứng tuyển vị trí kỹ sư phần mềm', en: 'Job application: software engineer' } }),
          matches: ids.map((id) => ({ credentialId: id, vct: VCT.diploma, issuerName: 'Trường Đại học Mẫu (DEMO)', claimSets: sets })),
          expiresAt: new Date(Date.now() + (qr.includes('short') ? 4000 : 272000)).toISOString(),
        };
        return { ok: true, request };
      },
      async submit() {
        await wait(1200);
        const outcome = localStorage.getItem('identra.harness.submit') ?? 'ok';
        return outcome === 'ok' ? { ok: true } : { ok: false, code: outcome as 'VERIFIER_ERROR' };
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
        return { ok: true, status: s.status ?? 'unknown', checks: [], checkedAt, lastValidAt: s.status === 'valid' ? checkedAt : null };
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
