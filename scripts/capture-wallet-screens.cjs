// DEV ONLY: screenshots of every wallet screen state for review, from a web export built with the
// scripted harness wallet (EXPO_PUBLIC_WALLET_HARNESS=1). Web rendering approximates native.
//
//   EXPO_PUBLIC_WALLET_HARNESS=1 npx expo export --platform web --output-dir /tmp/identra-app-web-harness
//   PLAYWRIGHT_CORE=$(npm root -g)/@playwright/cli/node_modules/playwright-core \
//     node scripts/capture-wallet-screens.cjs /tmp/identra-app-web-harness .review/wallet
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const [, , webDir, outDir] = process.argv;
if (!webDir || !outDir) throw new Error('usage: capture-wallet-screens.cjs <web export dir> <output dir>');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const PORT = 47342;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ttf': 'font/ttf', '.wasm': 'application/wasm' };

function serve() {
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(webDir, clean);
    if (!file.startsWith(path.resolve(webDir)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(webDir, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

const SESSION = JSON.stringify({ accessToken: 'harness', accessTokenExpiresAt: '2099-01-01T00:00:00Z', deviceId: 'harness', refreshToken: 'harness', refreshTokenExpiresAt: '2099-01-01T00:00:00Z', sessionId: 'harness', tokenType: 'Bearer', userId: 'harness' });
const settings = (theme, language) => JSON.stringify({ version: 2, settings: { language, theme, hideSensitiveData: true, notificationsEnabled: true, flowSettings: { identity: { requireAuthForCredential: false } } } });

async function shot(browser, { name, url, scenario = 'held', offer = 'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fapi-identra.awncorp.vn%2Fissuers%2Ftruong-mau%2Foffers%2Fdemo', presentation = 'openid4vp://?trusted', submit = 'ok', biometrics = 'on', theme = 'light', language = 'vi', width = 390, height = 844, act, settle = 2400 }) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: theme === 'dark' ? 'dark' : 'light' });
  await context.addInitScript(({ SESSION, scenario, offer, presentation, submit, biometrics, settingsJson }) => {
    localStorage.setItem('identra.harness.presentation', presentation);
    localStorage.setItem('identra.harness.submit', submit);
    localStorage.setItem('identra.harness.biometrics', biometrics);
    localStorage.setItem('identra.native.auth.session.v1', SESSION);
    localStorage.setItem('identra.native.settings.v2', settingsJson);
    localStorage.setItem('identra.harness.scenario', scenario);
    localStorage.setItem('identra.harness.offer', offer);
  }, { SESSION, scenario, offer, presentation, submit, biometrics, settingsJson: settings(theme, language) });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${PORT}${url}`);
  await page.waitForTimeout(settle);
  if (act) await act(page).catch((e) => errors.push(`action failed: ${e.message.split('\n')[0]}`));
  const file = path.join(outDir, `${name}-${width}${theme === 'dark' ? '-dark' : ''}${language === 'en' ? '-en' : ''}.png`);
  await page.screenshot({ path: file, fullPage: true });
  // The screens scroll inside their own scroll view: also capture the bottom when it does not fit.
  const scrolled = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].filter((d) => d.scrollHeight > d.clientHeight + 4 && getComputedStyle(d).overflowY !== 'visible').sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    if (!el) return false;
    el.scrollTop = el.scrollHeight;
    return true;
  });
  if (scrolled) {
    await page.waitForTimeout(200);
    await page.screenshot({ path: file.replace(/\.png$/, '-bottom.png') });
  }
  await context.close();
  if (errors.length) console.log(`  ${name}: page errors: ${errors.join(' | ').slice(0, 300)}`);
  console.log(`  ${file}`);
}

const typePin = (pin, submit = true) => async (page) => {
  await page.locator('input[aria-label^="Mã PIN"], input[aria-label^="The "]').first().fill(pin);
  if (submit) {
    await page.getByRole('button', { name: /Nhận giấy tờ|Receive document/ }).last().click();
    await page.waitForTimeout(1500);
  }
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const tap = (text) => async (p) => {
    await p.getByText(text, typeof text === 'string' ? { exact: true } : undefined).first().click();
    await p.waitForTimeout(400);
  };
  const share = (wait = 1800) => async (p) => {
    await p.getByText(/^(Chia sẻ|Share)$/).last().click();
    await p.waitForTimeout(wait);
  };
  const present = '/present-credential';
  const didOffer = 'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fapi-identra.awncorp.vn%2Fissuers%2Ftruong-did%2Foffers%2Fdid';
  const checkAgain = async (p) => {
    await p.getByText(/^(Kiểm tra lại|Check again)$/).first().click();
    await p.waitForTimeout(1200);
  };
  // resolve 0.7 s + list 0.3 s + values 0.4 s in the harness
  const presentStates = [
    { name: 'present-checking', url: present, settle: 250 },
    { name: 'present-trusted', url: present, settle: 2600 },
    { name: 'present-trusted-revealed', url: present, act: tap(/^(Hiện|Show)$/) },
    { name: 'present-trusted-less', url: present, act: tap(/^(Chia sẻ ít hơn|Share less)$/) },
    { name: 'present-withheld-open', url: present, act: tap(/^(Không chia sẻ|Not shared) \(3\)$/) },
    { name: 'present-chooser', url: present, presentation: 'openid4vp://?two-docs' },
    { name: 'present-untrusted', url: present, presentation: 'openid4vp://?untrusted' },
    { name: 'present-untrusted-confirm', url: present, presentation: 'openid4vp://?untrusted', act: tap(/^(Vẫn chia sẻ|Share anyway)$/) },
    ...['CERT_CHAIN_UNTRUSTED', 'CLIENT_ID_MISMATCH', 'SIGNATURE_INVALID', 'REQUEST_INVALID', 'REQUEST_EXPIRED', 'URL_NOT_ALLOWED', 'TRUST_LIST_UNAVAILABLE'].map((code) => ({ name: `present-refused-${code.toLowerCase()}`, url: present, presentation: `openid4vp://?${code}` })),
    { name: 'present-nomatch', url: present, presentation: 'openid4vp://?nomatch' },
    { name: 'present-revoked', url: present, presentation: 'openid4vp://?revoked' },
    { name: 'present-invalid', url: present, presentation: 'openid4vp://?invalid-doc' },
    { name: 'present-three-options', url: present, presentation: 'openid4vp://?three-sets' },
    // DID trust path (ADR-0020): a DID-path document alone, and beside an X.509 one.
    { name: 'present-did', url: present, scenario: 'did', presentation: 'openid4vp://?did-doc' },
    { name: 'present-mixed', url: present, scenario: 'did', presentation: 'openid4vp://?mixed-docs' },
    { name: 'present-three-options-middle', url: present, presentation: 'openid4vp://?three-sets', act: tap(/^(Gửi|Sends): [^,]+, [^,]+, (Hạng tốt nghiệp|Degree classification)$/) },
    { name: 'present-expired', url: present, presentation: 'openid4vp://?short', settle: 5600 },
    { name: 'present-sending', url: present, act: share(300) },
    { name: 'present-sent', url: present, act: share() },
    ...['USER_CANCELLED', 'DEVICE_LOCKED', 'KEY_INVALIDATED', 'VERIFIER_ERROR', 'NETWORK_ERROR'].map((code) => ({ name: `present-submit-${code.toLowerCase()}`, url: present, submit: code, act: share() })),
  ];
  const states = [
    { name: 'receive-checking', url: '/receive-credential', settle: 250 },
    { name: 'receive-consent', url: '/receive-credential' },
    { name: 'receive-pin-typed', url: '/receive-credential', act: typePin('4815', false) },
    { name: 'receive-wrong-pin', url: '/receive-credential', act: typePin('000000') },
    { name: 'receive-offline-on-accept', url: '/receive-credential', act: typePin('333333') },
    { name: 'receive-accepting', url: '/receive-credential', act: async (p) => { await typePin('123456', false)(p); await p.getByRole('button', { name: /Nhận giấy tờ|Receive document/ }).last().click(); await p.waitForTimeout(300); } },
    { name: 'receive-success', url: '/receive-credential', act: typePin('123456') },
    { name: 'receive-device-not-ready', url: '/receive-credential', biometrics: 'off' },
    { name: 'receive-resume', url: '/receive-credential', act: typePin('444444') },
    { name: 'receive-resume-offline', url: '/receive-credential', act: typePin('555555') },
    { name: 'detail-invalid', url: '/credentials/h4' },
    { name: 'receive-invalid-credential', url: '/receive-credential', act: typePin('111111') },
    { name: 'receive-expired-on-accept', url: '/receive-credential', act: typePin('222222') },
    { name: 'receive-expired-code', url: '/receive-credential', offer: 'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fx%2Fexpired' },
    { name: 'receive-offline-code', url: '/receive-credential', offer: 'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fx%2Foffline' },
    { name: 'list-held', url: '/credentials' },
    { name: 'list-empty', url: '/credentials', scenario: 'empty' },
    { name: 'list-restored', url: '/credentials', scenario: 'restored' },
    { name: 'list-catalogue', url: '/credentials', scenario: 'catalogue' },
    { name: 'list-failed', url: '/credentials', scenario: 'broken' },
    { name: 'detail-valid', url: '/credentials/h1' },
    { name: 'detail-valid-revealed', url: '/credentials/h1', act: async (p) => { await p.getByRole('button', { name: /^Hiện$/ }).click(); await p.waitForTimeout(200); } },
    { name: 'detail-unknown', url: '/credentials/h2' },
    { name: 'detail-revoked', url: '/credentials/h3' },
    { name: 'detail-refresh-failed', url: '/credentials/h1', scenario: 'broken', act: async (p) => { await p.getByText('Kiểm tra lại').click(); await p.waitForTimeout(1200); } },
    { name: 'detail-not-found', url: '/credentials/h1', scenario: 'empty' },
    { name: 'restore-confirm', url: '/wallet-restore', scenario: 'restored' },
    { name: 'restore-list', url: '/wallet-restore', scenario: 'catalogue' },
    { name: 'backup-settings', url: '/settings-backup' },
    { name: 'wallet-home', url: '/wallet' },
    { name: 'wallet-home-empty', url: '/wallet', scenario: 'empty' },
    { name: 'wallet-home-failed', url: '/wallet', scenario: 'broken' },
    { name: 'wallet-home-restored', url: '/wallet', scenario: 'restored' },
    // DID trust path (ADR-0020).
    { name: 'list-did', url: '/credentials', scenario: 'did' },
    { name: 'wallet-home-did', url: '/wallet', scenario: 'did' },
    { name: 'detail-did-valid', url: '/credentials/d1', scenario: 'did' },
    { name: 'detail-did-unknown', url: '/credentials/d2', scenario: 'did' },
    { name: 'detail-did-unknown-rechecked', url: '/credentials/d2', scenario: 'did', act: checkAgain },
    { name: 'detail-did-unsupported-rechecked', url: '/credentials/d4', scenario: 'did', act: checkAgain },
    { name: 'detail-did-invalid-rechecked', url: '/credentials/d3', scenario: 'did', act: checkAgain },
    { name: 'receive-did-consent', url: '/receive-credential', offer: didOffer },
    { name: 'receive-did-unsupported', url: '/receive-credential', offer: 'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fapi-identra.awncorp.vn%2Fissuers%2Ftruong-did%2Foffers%2Funsupported' },
    { name: 'receive-did-success', url: '/receive-credential', offer: didOffer, act: typePin('123456') },
    { name: 'receive-did-unresolved', url: '/receive-credential', offer: didOffer, act: typePin('666666') },
    { name: 'receive-did-unresolved-retried', url: '/receive-credential', offer: didOffer, act: async (p) => { await typePin('666666')(p); await p.getByRole('button', { name: /^(Thử lại|Try again)$/ }).last().click(); await p.waitForTimeout(1500); } },
  ];
  const only = process.env.CAPTURE_ONLY;
  const all = [...states, ...presentStates].filter((x) => !only || x.name.startsWith(only));
  for (const width of [390, 360]) {
    for (const s of all) await shot(browser, { ...s, width, height: width === 360 ? 740 : 844 });
  }
  const themed = ['receive-consent', 'receive-wrong-pin', 'list-held', 'detail-valid', 'restore-confirm', 'present-trusted', 'present-trusted-less', 'present-chooser', 'present-untrusted', 'present-untrusted-confirm', 'present-refused-cert_chain_untrusted', 'present-refused-trust_list_unavailable', 'present-nomatch', 'present-revoked', 'present-invalid', 'present-three-options', 'present-expired', 'present-sent', 'present-submit-key_invalidated', 'list-did', 'detail-did-valid', 'detail-did-invalid-rechecked', 'receive-did-consent', 'receive-did-unsupported', 'detail-did-unsupported-rechecked', 'receive-did-success', 'receive-did-unresolved', 'present-mixed'];
  for (const s of all.filter((x) => themed.includes(x.name))) {
    await shot(browser, { ...s, theme: 'dark' });
    await shot(browser, { ...s, language: 'en' });
  }
  await browser.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
