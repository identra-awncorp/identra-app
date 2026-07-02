export type PaymentFeatureAvailability = 'comingSoon' | 'demo';

const demoPaymentActionIds = new Set(['transfer', 'receive', 'phone', 'bill', 'history', 'utilities']);
const demoExploreActionTargets = new Set(['bill', 'card', 'security']);

export function getPaymentActionAvailability(actionId: string): PaymentFeatureAvailability {
  return demoPaymentActionIds.has(actionId) ? 'demo' : 'comingSoon';
}

export function isPaymentActionComingSoon(actionId: string) {
  return getPaymentActionAvailability(actionId) === 'comingSoon';
}

export function isPaymentExploreActionComingSoon(actionTarget: string) {
  return !demoExploreActionTargets.has(actionTarget);
}
