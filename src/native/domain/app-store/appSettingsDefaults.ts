import type { AppFlowSettings, AppSettings, Language, ThemeMode } from '../../types';

export const defaultFlowSettings: AppFlowSettings = {
  chat: {
    messageRequests: true,
    archivedChats: true,
    aiChat: true,
    activeStatus: true,
    chatBubbles: false,
    privacyOnlineStatus: true,
    privacyReadReceipts: true,
    privacyTypingIndicator: true,
    notificationPreview: true,
    notificationSoundVibration: true,
    notificationMuteGroups: false,
    mediaAutoDownload: true,
    mediaSaveToDevice: false,
    safetyUnknownLinks: true,
    safetyBlockRiskyFiles: true,
    safetyFilterStrangers: true,
  },
  feed: {
    profileVisibility: true,
    feedNotifications: true,
    communityHighlights: true,
    bookmarksSync: true,
    interestPersonalization: true,
    privacySensitiveContent: true,
    mediaAutoplay: false,
  },
  scan: {
    confirmBeforeOpenLink: true,
    riskyQrWarnings: true,
    verifiedLinksOnly: false,
    vibrateOnSuccess: true,
    soundOnSuccess: false,
    saveScanHistory: true,
    autoTorchLowLight: false,
    resetZoomAfterScan: true,
    discardPickedQrImages: true,
  },
  payment: {
    hideBalanceByDefault: false,
    maskCardNumber: true,
    hideSensitiveTransactions: true,
    requireAuthBeforeTransaction: true,
    requireAuthForCvv: true,
    confirmBeforeTransfer: true,
    confirmBeforeBill: true,
    confirmBeforeTopup: true,
    dailyLimitWarning: true,
    notifyMoneyIn: true,
    notifyMoneyOut: true,
    notifyBillDue: true,
    notifyFailedTransaction: true,
    cardOnlinePayments: true,
    cardContactless: true,
    cardAtmWithdrawals: true,
  },
  identity: {
    hideSensitiveData: true,
    compactDid: true,
    requireAuthForCredential: true,
    autoLockSharing: true,
    askBeforeShareAttributes: true,
    expiringShareQr: true,
    credentialExpiryWarnings: true,
    verificationFailureWarnings: true,
    activityLogging: true,
  },
};

function normalizeLanguage(value: unknown): Language {
  return value === 'en' ? 'en' : 'vi';
}

function normalizeTheme(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export function normalizeFlowSettings(settings?: Partial<AppFlowSettings>): AppFlowSettings {
  return {
    chat: { ...defaultFlowSettings.chat, ...(settings?.chat ?? {}) },
    feed: { ...defaultFlowSettings.feed, ...(settings?.feed ?? {}) },
    scan: { ...defaultFlowSettings.scan, ...(settings?.scan ?? {}) },
    payment: { ...defaultFlowSettings.payment, ...(settings?.payment ?? {}) },
    identity: { ...defaultFlowSettings.identity, ...(settings?.identity ?? {}) },
  };
}

export function normalizeAppSettings(settings?: Partial<AppSettings>): AppSettings {
  return {
    language: normalizeLanguage(settings?.language),
    theme: normalizeTheme(settings?.theme),
    notificationsEnabled: settings?.notificationsEnabled ?? true,
    hideSensitiveData: settings?.hideSensitiveData ?? true,
    flowSettings: normalizeFlowSettings(settings?.flowSettings),
  };
}
