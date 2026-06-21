export type Language = 'vi' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';
export type CredentialStatus = 'verified' | 'pending' | 'expired';
export type TabKey = 'wallet' | 'scan' | 'activity' | 'settings';

export type ScreenKey =
  | 'wallet'
  | 'credentials'
  | 'credential-detail'
  | 'profile'
  | 'security'
  | 'share'
  | 'share-qr'
  | 'connection-qr'
  | 'chat-list'
  | 'chat'
  | 'notifications'
  | 'scan'
  | 'activity'
  | 'settings'
  | 'settings-backup'
  | 'settings-display'
  | 'settings-governance'
  | 'settings-notifications'
  | 'settings-sharing'
  | 'settings-data'
  | 'settings-help'
  | 'settings-about';

export type CredentialIconName =
  | 'graduation'
  | 'languages'
  | 'shield'
  | 'bank'
  | 'clock'
  | 'security'
  | 'identity'
  | 'briefcase';

export interface CredentialAttribute {
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  time?: string;
  expiryDate?: string;
  status: CredentialStatus;
  icon: CredentialIconName;
  didIssuer: string;
  didHolder: string;
  signature: string;
  attributes: CredentialAttribute[];
  isDemo?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  expiresAt?: string;
  type: 'verify' | 'share' | 'add' | 'security' | 'scan';
  status?: 'success' | 'pending' | 'failed';
  title: string;
  description: string;
  partner: string;
  unread?: boolean;
  isNew?: boolean;
  isDemo?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  dob: string;
  studentId: string;
  school: string;
  nationalId: string;
  email: string;
  phone: string;
  address: string;
  did: string;
}

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  hideSensitiveData: boolean;
}
