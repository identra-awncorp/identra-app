import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CREDENTIALS,
  INITIAL_PROFILE,
  INITIAL_SETTINGS,
} from '../data/demo/identityDemoData';
import type { PersistedAppState } from '../domain/app-store/appStoreStateService';

export const initialAppStoreState: PersistedAppState = {
  credentials: INITIAL_CREDENTIALS,
  logs: INITIAL_ACTIVITY_LOGS,
  profile: INITIAL_PROFILE,
  settings: INITIAL_SETTINGS,
};
