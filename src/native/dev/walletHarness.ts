// DEV ONLY: a scripted in-memory WalletApi for rendering the wallet screens on web for review
// (EXPO_PUBLIC_WALLET_HARNESS=1, see docs/runbooks/wallet-screen-review.md). A normal build never
// includes this file (walletRuntime.ts drops the branch at build time). No real protocol runs here.
//
// Scenario (localStorage 'identra.harness.scenario'): empty | held | restored | catalogue | broken.
// QR text containing "expired" / "offline" / "invalid" fails resolve accordingly. PIN 000000 is
// wrong, 111111 gives a credential that fails its checks, 222222 an expired offer, 333333 no network.
import type { CredentialDetails, ResolvedOffer } from '@identra/sdk-app';
import { VCT } from '@identra/sdk-core';

import type { WalletApi, WalletCredentialSummary } from '../domain/wallet/walletContainer';

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
    held.set('h1', { id: 'h1', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Mẫu (TEST)', status: 'valid', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-11-18T09:30:00Z' });
    held.set('h2', { id: 'h2', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Mẫu (TEST)', status: 'unknown', statusCheckedAt: '2026-11-10T02:10:00Z', createdAt: '2026-11-02T09:30:00Z' });
    held.set('h3', { id: 'h3', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Mẫu (TEST)', status: 'revoked', statusCheckedAt: '2026-11-19T02:10:00Z', createdAt: '2026-10-21T09:30:00Z' });
  }
  const offer: ResolvedOffer = {
    issuerUri: ISS,
    issuerDisplay: [{ name: 'Trường Mẫu', locale: 'vi' }, { name: 'Sample University', locale: 'en' }],
    configuration: { id: 'bang-tot-nghiep-v1', vct: VCT.diploma, display: [{ name: 'Bằng tốt nghiệp', locale: 'vi' }] },
    txCode: { length: 6, inputMode: 'numeric', description: null },
  };
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
      async accept(_offer, { txCode }) {
        await wait(900);
        if (txCode === '000000') return { ok: false, code: 'TX_CODE_WRONG' };
        if (txCode === '111111') return { ok: false, code: 'CREDENTIAL_INVALID', checks: [{ id: 'signature', ok: true, code: null }, { id: 'issuer_trust', ok: false, code: 'ISSUER_NOT_TRUSTED' }] };
        if (txCode === '222222') return { ok: false, code: 'OFFER_EXPIRED' };
        if (txCode === '333333') return { ok: false, code: 'NETWORK_ERROR' };
        const id = `r${held.size + 1}`;
        held.set(id, { id, vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Mẫu (TEST)', status: 'valid', statusCheckedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
        return { ok: true, credentialId: id, vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)' };
      },
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
        held.set(id, { ...s, statusCheckedAt: new Date().toISOString() });
        return { ok: true, status: s.status ?? 'unknown', checks: [] };
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
