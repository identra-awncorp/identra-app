import {
  Archive,
  BadgeAlert,
  Bell,
  Bot,
  Bookmark,
  Camera,
  CircleDot,
  CreditCard,
  Download,
  Eye,
  FileWarning,
  Flashlight,
  Grid2X2,
  Heart,
  History,
  Image,
  Link,
  LockKeyhole,
  MessageCircle,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  UserX,
  UsersRound,
  Vibrate,
  Video,
  Volume2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react-native';

import type { I18nKey } from '../../i18n';
import type { AppFlowKey } from '../../types';

export type SideMenuSettingItemConfig =
  | {
      type: 'toggle';
      id: string;
      settingId: string;
      titleKey: I18nKey;
      descriptionKey: I18nKey;
      icon: LucideIcon;
      locked?: boolean;
    }
  | {
      type: 'choice' | 'dropdown' | 'group' | 'action';
      id: string;
      titleKey: I18nKey;
      descriptionKey: I18nKey;
      icon: LucideIcon;
    };

export interface SideMenuSettingsSectionConfig {
  id: string;
  titleKey: I18nKey;
  items: SideMenuSettingItemConfig[];
}

export interface SideMenuFlowConfig {
  key: AppFlowKey;
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  sections: SideMenuSettingsSectionConfig[];
}

export const sideMenuSettingsByFlow: Record<AppFlowKey, SideMenuFlowConfig> = {
  chat: {
    key: 'chat',
    titleKey: 'app.sideMenu.chat.title',
    descriptionKey: 'app.sideMenu.chat.description',
    sections: [
      {
        id: 'manage',
        titleKey: 'app.sideMenu.chat.manageSection',
        items: [
          { type: 'toggle', id: 'messageRequests', settingId: 'messageRequests', titleKey: 'app.sideMenu.chat.messageRequestsTitle', descriptionKey: 'app.sideMenu.chat.messageRequestsDescription', icon: MessageCircle },
          { type: 'toggle', id: 'archivedChats', settingId: 'archivedChats', titleKey: 'app.sideMenu.chat.archivedChatsTitle', descriptionKey: 'app.sideMenu.chat.archivedChatsDescription', icon: Archive },
          { type: 'toggle', id: 'aiChat', settingId: 'aiChat', titleKey: 'app.sideMenu.chat.aiChatTitle', descriptionKey: 'app.sideMenu.chat.aiChatDescription', icon: Bot },
          { type: 'toggle', id: 'activeStatus', settingId: 'activeStatus', titleKey: 'app.sideMenu.chat.activeStatusTitle', descriptionKey: 'app.sideMenu.chat.activeStatusDescription', icon: CircleDot },
          { type: 'toggle', id: 'chatBubbles', settingId: 'chatBubbles', titleKey: 'app.sideMenu.chat.chatBubblesTitle', descriptionKey: 'app.sideMenu.chat.chatBubblesDescription', icon: MessageCircle },
        ],
      },
      {
        id: 'privacy',
        titleKey: 'app.sideMenu.chat.privacySection',
        items: [
          { type: 'toggle', id: 'privacyOnlineStatus', settingId: 'privacyOnlineStatus', titleKey: 'app.sideMenu.chat.onlineStatusTitle', descriptionKey: 'app.sideMenu.chat.onlineStatusDescription', icon: Eye },
          { type: 'toggle', id: 'privacyReadReceipts', settingId: 'privacyReadReceipts', titleKey: 'app.sideMenu.chat.readReceiptsTitle', descriptionKey: 'app.sideMenu.chat.readReceiptsDescription', icon: ShieldCheck },
          { type: 'toggle', id: 'privacyTypingIndicator', settingId: 'privacyTypingIndicator', titleKey: 'app.sideMenu.chat.typingIndicatorTitle', descriptionKey: 'app.sideMenu.chat.typingIndicatorDescription', icon: MessageCircle },
        ],
      },
      {
        id: 'notifications',
        titleKey: 'app.sideMenu.chat.notificationsSection',
        items: [
          { type: 'toggle', id: 'notificationPreview', settingId: 'notificationPreview', titleKey: 'app.sideMenu.chat.previewTitle', descriptionKey: 'app.sideMenu.chat.previewDescription', icon: Bell },
          { type: 'toggle', id: 'notificationSoundVibration', settingId: 'notificationSoundVibration', titleKey: 'app.sideMenu.chat.soundVibrationTitle', descriptionKey: 'app.sideMenu.chat.soundVibrationDescription', icon: Volume2 },
          { type: 'toggle', id: 'notificationMuteGroups', settingId: 'notificationMuteGroups', titleKey: 'app.sideMenu.chat.muteGroupsTitle', descriptionKey: 'app.sideMenu.chat.muteGroupsDescription', icon: UsersRound },
        ],
      },
      {
        id: 'mediaSafety',
        titleKey: 'app.sideMenu.chat.mediaSafetySection',
        items: [
          { type: 'toggle', id: 'mediaAutoDownload', settingId: 'mediaAutoDownload', titleKey: 'app.sideMenu.chat.autoDownloadTitle', descriptionKey: 'app.sideMenu.chat.autoDownloadDescription', icon: Download },
          { type: 'toggle', id: 'mediaSaveToDevice', settingId: 'mediaSaveToDevice', titleKey: 'app.sideMenu.chat.saveMediaTitle', descriptionKey: 'app.sideMenu.chat.saveMediaDescription', icon: Image },
          { type: 'toggle', id: 'safetyUnknownLinks', settingId: 'safetyUnknownLinks', titleKey: 'app.sideMenu.chat.unknownLinksTitle', descriptionKey: 'app.sideMenu.chat.unknownLinksDescription', icon: Link },
          { type: 'toggle', id: 'safetyBlockRiskyFiles', settingId: 'safetyBlockRiskyFiles', titleKey: 'app.sideMenu.chat.blockFilesTitle', descriptionKey: 'app.sideMenu.chat.blockFilesDescription', icon: FileWarning },
          { type: 'toggle', id: 'safetyFilterStrangers', settingId: 'safetyFilterStrangers', titleKey: 'app.sideMenu.chat.filterStrangersTitle', descriptionKey: 'app.sideMenu.chat.filterStrangersDescription', icon: UserX },
        ],
      },
    ],
  },
  feed: {
    key: 'feed',
    titleKey: 'app.sideMenu.feedSettings.title',
    descriptionKey: 'app.sideMenu.feedSettings.description',
    sections: [
      {
        id: 'feed',
        titleKey: 'app.sideMenu.feedSettings.feedSection',
        items: [
          { type: 'toggle', id: 'profileVisibility', settingId: 'profileVisibility', titleKey: 'app.sideMenu.feedSettings.profileTitle', descriptionKey: 'app.sideMenu.feedSettings.profileDescription', icon: UserRound },
          { type: 'toggle', id: 'feedNotifications', settingId: 'feedNotifications', titleKey: 'app.sideMenu.feedSettings.notificationsTitle', descriptionKey: 'app.sideMenu.feedSettings.notificationsDescription', icon: Bell },
          { type: 'toggle', id: 'communityHighlights', settingId: 'communityHighlights', titleKey: 'app.sideMenu.feedSettings.communityTitle', descriptionKey: 'app.sideMenu.feedSettings.communityDescription', icon: UsersRound },
          { type: 'toggle', id: 'bookmarksSync', settingId: 'bookmarksSync', titleKey: 'app.sideMenu.feedSettings.bookmarksTitle', descriptionKey: 'app.sideMenu.feedSettings.bookmarksDescription', icon: Bookmark },
          { type: 'toggle', id: 'interestPersonalization', settingId: 'interestPersonalization', titleKey: 'app.sideMenu.feedSettings.interestsTitle', descriptionKey: 'app.sideMenu.feedSettings.interestsDescription', icon: Heart },
          { type: 'toggle', id: 'privacySensitiveContent', settingId: 'privacySensitiveContent', titleKey: 'app.sideMenu.feedSettings.privacyTitle', descriptionKey: 'app.sideMenu.feedSettings.privacyDescription', icon: LockKeyhole },
          { type: 'toggle', id: 'mediaAutoplay', settingId: 'mediaAutoplay', titleKey: 'app.sideMenu.feedSettings.mediaTitle', descriptionKey: 'app.sideMenu.feedSettings.mediaDescription', icon: Video },
        ],
      },
    ],
  },
  scan: {
    key: 'scan',
    titleKey: 'app.sideMenu.scan.title',
    descriptionKey: 'app.sideMenu.scan.description',
    sections: [
      {
        id: 'security',
        titleKey: 'app.sideMenu.scan.securitySection',
        items: [
          { type: 'toggle', id: 'confirmBeforeOpenLink', settingId: 'confirmBeforeOpenLink', titleKey: 'app.sideMenu.scan.confirmLinkTitle', descriptionKey: 'app.sideMenu.scan.confirmLinkDescription', icon: Link },
          { type: 'toggle', id: 'riskyQrWarnings', settingId: 'riskyQrWarnings', titleKey: 'app.sideMenu.scan.riskWarningTitle', descriptionKey: 'app.sideMenu.scan.riskWarningDescription', icon: ShieldAlert },
          { type: 'toggle', id: 'verifiedLinksOnly', settingId: 'verifiedLinksOnly', titleKey: 'app.sideMenu.scan.verifiedLinksTitle', descriptionKey: 'app.sideMenu.scan.verifiedLinksDescription', icon: ShieldCheck },
        ],
      },
      {
        id: 'behavior',
        titleKey: 'app.sideMenu.scan.behaviorSection',
        items: [
          { type: 'toggle', id: 'vibrateOnSuccess', settingId: 'vibrateOnSuccess', titleKey: 'app.sideMenu.scan.vibrateTitle', descriptionKey: 'app.sideMenu.scan.vibrateDescription', icon: Vibrate },
          { type: 'toggle', id: 'soundOnSuccess', settingId: 'soundOnSuccess', titleKey: 'app.sideMenu.scan.soundTitle', descriptionKey: 'app.sideMenu.scan.soundDescription', icon: Volume2 },
          { type: 'toggle', id: 'saveScanHistory', settingId: 'saveScanHistory', titleKey: 'app.sideMenu.scan.historyTitle', descriptionKey: 'app.sideMenu.scan.historyDescription', icon: History },
          { type: 'toggle', id: 'autoTorchLowLight', settingId: 'autoTorchLowLight', titleKey: 'app.sideMenu.scan.autoTorchTitle', descriptionKey: 'app.sideMenu.scan.autoTorchDescription', icon: Flashlight },
          { type: 'toggle', id: 'resetZoomAfterScan', settingId: 'resetZoomAfterScan', titleKey: 'app.sideMenu.scan.resetZoomTitle', descriptionKey: 'app.sideMenu.scan.resetZoomDescription', icon: Camera },
          { type: 'toggle', id: 'discardPickedQrImages', settingId: 'discardPickedQrImages', titleKey: 'app.sideMenu.scan.discardImagesTitle', descriptionKey: 'app.sideMenu.scan.discardImagesDescription', icon: Image },
        ],
      },
    ],
  },
  payment: {
    key: 'payment',
    titleKey: 'app.sideMenu.payment.title',
    descriptionKey: 'app.sideMenu.payment.description',
    sections: [
      {
        id: 'privacy',
        titleKey: 'app.sideMenu.payment.privacySection',
        items: [
          { type: 'toggle', id: 'hideBalanceByDefault', settingId: 'hideBalanceByDefault', titleKey: 'app.sideMenu.payment.hideBalanceTitle', descriptionKey: 'app.sideMenu.payment.hideBalanceDescription', icon: Eye },
          { type: 'toggle', id: 'maskCardNumber', settingId: 'maskCardNumber', titleKey: 'app.sideMenu.payment.maskCardTitle', descriptionKey: 'app.sideMenu.payment.maskCardDescription', icon: CreditCard },
          { type: 'toggle', id: 'hideSensitiveTransactions', settingId: 'hideSensitiveTransactions', titleKey: 'app.sideMenu.payment.hideTransactionsTitle', descriptionKey: 'app.sideMenu.payment.hideTransactionsDescription', icon: LockKeyhole },
        ],
      },
      {
        id: 'security',
        titleKey: 'app.sideMenu.payment.securitySection',
        items: [
          { type: 'toggle', id: 'requireAuthBeforeTransaction', settingId: 'requireAuthBeforeTransaction', titleKey: 'app.sideMenu.payment.authTransactionTitle', descriptionKey: 'app.sideMenu.payment.authTransactionDescription', icon: ShieldCheck },
          { type: 'toggle', id: 'requireAuthForCvv', settingId: 'requireAuthForCvv', titleKey: 'app.sideMenu.payment.authCvvTitle', descriptionKey: 'app.sideMenu.payment.authCvvDescription', icon: CreditCard },
          { type: 'toggle', id: 'confirmBeforeTransfer', settingId: 'confirmBeforeTransfer', titleKey: 'app.sideMenu.payment.confirmTransferTitle', descriptionKey: 'app.sideMenu.payment.confirmTransferDescription', icon: WalletCards },
          { type: 'toggle', id: 'confirmBeforeBill', settingId: 'confirmBeforeBill', titleKey: 'app.sideMenu.payment.confirmBillTitle', descriptionKey: 'app.sideMenu.payment.confirmBillDescription', icon: ReceiptText },
          { type: 'toggle', id: 'confirmBeforeTopup', settingId: 'confirmBeforeTopup', titleKey: 'app.sideMenu.payment.confirmTopupTitle', descriptionKey: 'app.sideMenu.payment.confirmTopupDescription', icon: Smartphone },
          { type: 'toggle', id: 'dailyLimitWarning', settingId: 'dailyLimitWarning', titleKey: 'app.sideMenu.payment.limitWarningTitle', descriptionKey: 'app.sideMenu.payment.limitWarningDescription', icon: BadgeAlert },
        ],
      },
      {
        id: 'notificationsCards',
        titleKey: 'app.sideMenu.payment.notificationsCardsSection',
        items: [
          { type: 'toggle', id: 'notifyMoneyIn', settingId: 'notifyMoneyIn', titleKey: 'app.sideMenu.payment.moneyInTitle', descriptionKey: 'app.sideMenu.payment.moneyInDescription', icon: Bell },
          { type: 'toggle', id: 'notifyMoneyOut', settingId: 'notifyMoneyOut', titleKey: 'app.sideMenu.payment.moneyOutTitle', descriptionKey: 'app.sideMenu.payment.moneyOutDescription', icon: Bell },
          { type: 'toggle', id: 'notifyBillDue', settingId: 'notifyBillDue', titleKey: 'app.sideMenu.payment.billDueTitle', descriptionKey: 'app.sideMenu.payment.billDueDescription', icon: ReceiptText },
          { type: 'toggle', id: 'notifyFailedTransaction', settingId: 'notifyFailedTransaction', titleKey: 'app.sideMenu.payment.failedTransactionTitle', descriptionKey: 'app.sideMenu.payment.failedTransactionDescription', icon: ShieldAlert },
          { type: 'toggle', id: 'cardOnlinePayments', settingId: 'cardOnlinePayments', titleKey: 'app.sideMenu.payment.onlinePaymentTitle', descriptionKey: 'app.sideMenu.payment.onlinePaymentDescription', icon: CreditCard },
          { type: 'toggle', id: 'cardContactless', settingId: 'cardContactless', titleKey: 'app.sideMenu.payment.contactlessTitle', descriptionKey: 'app.sideMenu.payment.contactlessDescription', icon: Smartphone },
          { type: 'toggle', id: 'cardAtmWithdrawals', settingId: 'cardAtmWithdrawals', titleKey: 'app.sideMenu.payment.atmTitle', descriptionKey: 'app.sideMenu.payment.atmDescription', icon: WalletCards },
        ],
      },
    ],
  },
  miniApp: {
    key: 'miniApp',
    titleKey: 'app.sideMenu.miniApp.title',
    descriptionKey: 'app.sideMenu.miniApp.description',
    sections: [
      {
        id: 'discovery',
        titleKey: 'app.sideMenu.miniApp.discoverySection',
        items: [
          { type: 'toggle', id: 'showFrequentApps', settingId: 'showFrequentApps', titleKey: 'app.sideMenu.miniApp.frequentTitle', descriptionKey: 'app.sideMenu.miniApp.frequentDescription', icon: Grid2X2 },
          { type: 'toggle', id: 'enableAppSuggestions', settingId: 'enableAppSuggestions', titleKey: 'app.sideMenu.miniApp.suggestionTitle', descriptionKey: 'app.sideMenu.miniApp.suggestionDescription', icon: Sparkles },
          { type: 'toggle', id: 'publicServiceShortcuts', settingId: 'publicServiceShortcuts', titleKey: 'app.sideMenu.miniApp.publicServiceTitle', descriptionKey: 'app.sideMenu.miniApp.publicServiceDescription', icon: ShieldCheck },
          { type: 'toggle', id: 'miniAppNotifications', settingId: 'miniAppNotifications', titleKey: 'app.sideMenu.miniApp.notificationTitle', descriptionKey: 'app.sideMenu.miniApp.notificationDescription', icon: Bell },
        ],
      },
    ],
  },
  identity: {
    key: 'identity',
    titleKey: 'app.sideMenu.identitySettings.title',
    descriptionKey: 'app.sideMenu.identitySettings.description',
    sections: [
      {
        id: 'privacy',
        titleKey: 'app.sideMenu.identitySettings.privacySection',
        items: [
          { type: 'toggle', id: 'hideSensitiveData', settingId: 'hideSensitiveData', titleKey: 'app.sideMenu.identitySettings.hideDataTitle', descriptionKey: 'app.sideMenu.identitySettings.hideDataDescription', icon: Eye },
          { type: 'toggle', id: 'compactDid', settingId: 'compactDid', titleKey: 'app.sideMenu.identitySettings.compactDidTitle', descriptionKey: 'app.sideMenu.identitySettings.compactDidDescription', icon: UserRound },
          { type: 'toggle', id: 'requireAuthForCredential', settingId: 'requireAuthForCredential', titleKey: 'app.sideMenu.identitySettings.authCredentialTitle', descriptionKey: 'app.sideMenu.identitySettings.authCredentialDescription', icon: ShieldCheck },
          { type: 'toggle', id: 'autoLockSharing', settingId: 'autoLockSharing', titleKey: 'app.sideMenu.identitySettings.autoLockTitle', descriptionKey: 'app.sideMenu.identitySettings.autoLockDescription', icon: LockKeyhole },
        ],
      },
      {
        id: 'sharing',
        titleKey: 'app.sideMenu.identitySettings.sharingSection',
        items: [
          { type: 'toggle', id: 'askBeforeShareAttributes', settingId: 'askBeforeShareAttributes', titleKey: 'app.sideMenu.identitySettings.askShareTitle', descriptionKey: 'app.sideMenu.identitySettings.askShareDescription', icon: ShieldCheck },
          { type: 'toggle', id: 'expiringShareQr', settingId: 'expiringShareQr', titleKey: 'app.sideMenu.identitySettings.expiringQrTitle', descriptionKey: 'app.sideMenu.identitySettings.expiringQrDescription', icon: History, locked: true },
          { type: 'toggle', id: 'activityLogging', settingId: 'activityLogging', titleKey: 'app.sideMenu.identitySettings.activityLogTitle', descriptionKey: 'app.sideMenu.identitySettings.activityLogDescription', icon: History },
        ],
      },
    ],
  },
};

export function getSideMenuFlowForPathname(pathname: string): AppFlowKey {
  if (pathname === '/chat-list' || pathname === '/chat') return 'chat';
  if (pathname === '/scan' || pathname === '/connection-qr') return 'scan';
  if (pathname.startsWith('/payment')) return 'payment';
  if (pathname === '/mini-app') return 'miniApp';
  if (
    pathname === '/wallet' ||
    pathname.startsWith('/credentials') ||
    pathname === '/profile' ||
    pathname === '/security' ||
    pathname.startsWith('/share') ||
    pathname === '/activity'
  ) {
    return 'identity';
  }

  return 'feed';
}
