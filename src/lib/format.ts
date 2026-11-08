import { siteConfig } from '../config/site';

const nf0 = new Intl.NumberFormat(siteConfig.currency.locale, { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat(siteConfig.currency.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 145 -> « 145 € », 6.9 -> « 6,90 € » */
export const formatPrice = (value: number) =>
  `${(Number.isInteger(value) ? nf0 : nf2).format(value).replace(/\u202f|\u00a0/g, '\u00a0')}\u00a0${siteConfig.currency.label}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const pluralize = (n: number, one: string, many: string) => `${n}\u00a0${n > 1 ? many : one}`;

/** Normalise une chaîne pour la recherche (minuscules, sans accents). */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const isValidPhone = (s: string) => /^\+?[\d\s.-]{8,18}$/.test(s.trim());
