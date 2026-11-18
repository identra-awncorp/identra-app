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

async function shot(browser, { name, url, scenario = 'held', offer = 'openid-credential-offer://?credential_offer_uri=https%3A%2F%2Fapi-identra.awncorp.vn%2Fissuers%2Ftruong-mau%2Foffers%2Fdemo', theme = 'light', language = 'vi', width = 390, height = 844, act, settle = 1600 }) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: theme === 'dark' ? 'dark' : 'light' });
  await context.addInitScript(({ SESSION, scenario, offer, settingsJson }) => {
    localStorage.setItem('identra.native.auth.session.v1', SESSION);
    localStorage.setItem('identra.native.settings.v2', settingsJson);
    localStorage.setItem('identra.harness.scenario', scenario);
    localStorage.setItem('identra.harness.offer', offer);
  }, { SESSION, scenario, offer, settingsJson: settings(theme, language) });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${PORT}${url}`);
  await page.waitForTimeout(settle);
  if (act) await act(page).catch((e) => errors.push(`action failed: ${e.message.split('\n')[0]}`));
  const file = path.join(outDir, `${name}-${width}${theme === 'dark' ? '-dark' : ''}${language === 'en' ? '-en' : ''}.png`);
  await page.screenshot({ path: file, fullPage: true });
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
  const states = [
    { name: 'receive-checking', url: '/receive-credential', settle: 250 },
    { name: 'receive-consent', url: '/receive-credential' },
    { name: 'receive-pin-typed', url: '/receive-credential', act: typePin('4815', false) },
    { name: 'receive-wrong-pin', url: '/receive-credential', act: typePin('000000') },
    { name: 'receive-offline-on-accept', url: '/receive-credential', act: typePin('333333') },
    { name: 'receive-accepting', url: '/receive-credential', act: async (p) => { await typePin('123456', false)(p); await p.getByRole('button', { name: /Nhận giấy tờ|Receive document/ }).last().click(); await p.waitForTimeout(300); } },
    { name: 'receive-success', url: '/receive-credential', act: typePin('123456') },
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
  ];
  for (const width of [390, 360]) {
    for (const s of states) await shot(browser, { ...s, width, height: width === 360 ? 740 : 844 });
  }
  for (const s of states.filter((x) => ['receive-consent', 'receive-wrong-pin', 'list-held', 'detail-valid', 'restore-confirm'].includes(x.name))) {
    await shot(browser, { ...s, theme: 'dark' });
    await shot(browser, { ...s, language: 'en' });
  }
  await browser.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
