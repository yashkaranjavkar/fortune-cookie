import { createContext, useContext } from 'react';

// Currency symbol shown in the incentive screens, based on the region chosen in the job application.
// Africa uses the South African rand and Lat-Am the Brazilian real (the largest markets there);
// Ctl-Am uses the dollar. Only the symbol changes - incentive amounts stay the same.
export const REGION_CURRENCY = {
  "India": "₹",
  "Europe": "€",
  "Africa": "R",
  "Lat-Am": "R$",
  "Ctl-Am": "$"
};

export const DEFAULT_CURRENCY = "₹";

export const currencyFor = (region) => REGION_CURRENCY[region] || DEFAULT_CURRENCY;

export const CurrencyContext = createContext(DEFAULT_CURRENCY);
export const useCurrency = () => useContext(CurrencyContext);
