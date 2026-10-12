import { createContext, useContext } from 'react';
import { countryByName } from '../data/countries';

// Currency symbol shown in the incentive screens, from where the player is. Only the
// symbol changes - incentive amounts stay the same.
//
// The player details form asks for a country (src/data/countries.js); the older job
// application asks for one of five regions. Both work here.
export const REGION_CURRENCY = {
  "India": "₹",
  "Europe": "€",
  "Africa": "R",
  "Lat-Am": "R$",
  "Ctl-Am": "$"
};

// Countries on the euro (including the microstates and French overseas regions)
const EURO = 'AT BE HR CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES AD MC SM VA ME GF GP MQ RE YT BL MF PM AX'.split(' ');

// Countries with their own symbol; any other country shows "$"
const COUNTRY_CURRENCY = {
  IN: '₹', GB: '£', JE: '£', GG: '£', IM: '£', GI: '£', US: '$', CA: '$', AU: '$', NZ: '$', SG: '$',
  HK: '$', TW: '$', MX: '$', AR: '$', CL: '$', CO: '$', UY: '$', SV: '$', EC: '$', PA: '$',
  BR: 'R$', ZA: 'R', NA: '$', JP: '¥', CN: '¥', KR: '₩', CH: 'CHF', LI: 'CHF',
  SE: 'kr', NO: 'kr', DK: 'kr', IS: 'kr', PL: 'zł', CZ: 'Kč', HU: 'Ft', RO: 'lei', BG: 'лв',
  RU: '₽', UA: '₴', TR: '₺', IL: '₪', AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KD', BH: 'BD', OM: 'OMR',
  EG: 'E£', NG: '₦', GH: '₵', KE: 'KSh', UG: 'USh', TZ: 'TSh', MA: 'DH', ET: 'Br',
  PK: 'Rs', LK: 'Rs', NP: 'Rs', BD: '৳', ID: 'Rp', MY: 'RM', TH: '฿', VN: '₫', PH: '₱',
  PE: 'S/', CR: '₡', GT: 'Q', HN: 'L', NI: 'C$', DO: 'RD$', PY: '₲', BO: 'Bs',
};

export const DEFAULT_CURRENCY = "₹";

export const currencyFor = (place) => {
  if (!place) return DEFAULT_CURRENCY;
  if (REGION_CURRENCY[place]) return REGION_CURRENCY[place];
  const country = countryByName(place);
  if (!country) return DEFAULT_CURRENCY;
  if (EURO.includes(country.code)) return '€';
  return COUNTRY_CURRENCY[country.code] || '$';
};

export const CurrencyContext = createContext(DEFAULT_CURRENCY);
export const useCurrency = () => useContext(CurrencyContext);
