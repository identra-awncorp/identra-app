const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  bottomNavScreenKeys,
  getActiveTabForScreen,
  getPathForScreen,
  getScreenForPathname,
  getScreenForTab,
  initialScreen,
  screenPaths,
  shouldCaptureReturnScreen,
  shouldShowBottomNavForScreen,
  shouldUseFloatingBottomNav,
  tabScreens,
} = require('../.tmp-test/src/native/app/navigation/navigationLogic');

describe('navigationLogic', () => {
  it('starts the app on chat list and maps every bottom tab to the intended root screen', () => {
    assert.equal(initialScreen, 'chat-list');
    assert.deepEqual(tabScreens, {
      chat: 'chat-list',
      feed: 'news-feed',
      scan: 'scan',
      payment: 'payment',
      miniApp: 'mini-app',
    });
    assert.equal(getScreenForTab('feed'), 'news-feed');
    assert.equal(getScreenForTab('miniApp'), 'mini-app');
  });

  it('round-trips configured screens and route paths', () => {
    for (const [screen, path] of Object.entries(screenPaths)) {
      assert.equal(getPathForScreen(screen), path);
      assert.equal(getScreenForPathname(path), screen);
    }

    assert.equal(getScreenForPathname('/unknown'), null);
  });

  it('keeps bottom navigation only on approved top-level screens', () => {
    assert.deepEqual(bottomNavScreenKeys, ['chat-list', 'news-feed', 'scan', 'payment', 'mini-app']);
    assert.equal(shouldShowBottomNavForScreen('credentials'), false);
    assert.equal(shouldShowBottomNavForScreen('wallet'), false);
    assert.equal(shouldShowBottomNavForScreen('settings'), false);
    assert.equal(shouldShowBottomNavForScreen('activity'), false);
  });

  it('derives active tabs and special return/floating behavior', () => {
    assert.equal(getActiveTabForScreen('news-feed'), 'feed');
    assert.equal(getActiveTabForScreen('mini-app'), 'miniApp');
    assert.equal(getActiveTabForScreen('credentials'), null);
    assert.equal(getActiveTabForScreen('settings'), null);
    assert.equal(shouldUseFloatingBottomNav('news-feed'), true);
    assert.equal(shouldUseFloatingBottomNav('wallet'), false);
    assert.equal(shouldCaptureReturnScreen('notifications'), true);
    assert.equal(shouldCaptureReturnScreen('activity'), false);
  });
});
