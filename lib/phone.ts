import { COUNTRY_DIAL_CODES, DIAL_CODES_BY_LENGTH, findCountryByIso, type CountryDialCode } from './countryDialCodes';

export type ParsedPhone = {
  country: CountryDialCode;
  nationalNumber: string;
};

export function getDefaultCountry(): CountryDialCode {
  return findCountryByIso('FR') ?? COUNTRY_DIAL_CODES[0];
}

export function parsePhoneNumber(raw: string | null | undefined): ParsedPhone {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) {
    return { country: getDefaultCountry(), nationalNumber: '' };
  }

  const digits = trimmed.replace(/[^\d+]/g, '');
  const withPlus = digits.startsWith('+') ? digits : `+${digits}`;

  for (const country of DIAL_CODES_BY_LENGTH) {
    if (withPlus.startsWith(country.dial)) {
      return {
        country,
        nationalNumber: withPlus.slice(country.dial.length).replace(/\D/g, ''),
      };
    }
  }

  return {
    country: getDefaultCountry(),
    nationalNumber: withPlus.replace(/\D/g, ''),
  };
}

export function formatPhoneNumber(country: CountryDialCode, nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, '');
  if (!digits) return '';
  return `${country.dial}${digits}`;
}

export function formatPhoneDisplay(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return '';
  const { country, nationalNumber } = parsePhoneNumber(trimmed);
  if (!nationalNumber) return trimmed;
  return `${country.dial} ${nationalNumber}`;
}
