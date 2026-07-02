import type { I18nKey, I18nParams } from '../../i18n';
import type { PaymentFlowConfig } from '../../data/demo/paymentFlowDemoData';
import type { Offer, PaymentAction, PaymentCard, PromoBanner } from './paymentTypes';

type Translate = (key: I18nKey, params?: I18nParams) => string;

function key(path: string) {
  return `payment.${path}` as I18nKey;
}

function optional(t: Translate, path: string, fallback: string, params?: I18nParams) {
  const translationKey = key(path);
  const value = t(translationKey, params);
  return value === translationKey ? fallback : value;
}

export function paymentT(t: Translate, path: string, params?: I18nParams) {
  return t(key(path), params);
}

export function paymentActionLabel(t: Translate, action: PaymentAction) {
  return optional(t, `home.actions.${action.id}`, action.label);
}

export function paymentCardText(t: Translate, card: PaymentCard, field: 'accountType' | 'balanceLabel' | 'statementDate' | 'status') {
  return optional(t, `home.cards.${card.id}.${field}`, card[field]);
}

export function paymentPromoText(t: Translate, banner: PromoBanner, field: 'title' | 'description' | 'action') {
  return optional(t, `home.promos.${banner.id}.${field}`, banner[field]);
}

export function paymentOfferText(t: Translate, offer: Offer, field: 'title' | 'description') {
  return optional(t, `home.offers.${offer.id}.${field}`, offer[field]);
}

export function paymentFlowText(t: Translate, config: PaymentFlowConfig, field: 'title' | 'description' | 'status' | 'primaryAction') {
  return optional(t, `flows.${config.id}.${field}`, config[field]);
}

export function paymentFlowStepText(t: Translate, config: PaymentFlowConfig, index: number, field: 'title' | 'description') {
  return optional(t, `flows.${config.id}.step${index + 1}.${field}`, config.steps[index]?.[field] ?? '');
}
