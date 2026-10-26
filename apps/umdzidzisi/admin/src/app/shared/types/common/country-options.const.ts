import { SelectOption } from './select-option.type';

const COUNTRY_CODES: string[] = [
  'ZW',
  'ZA',
  'ZM',
  'BW',
  'MZ',
  'MW',
  'NA',
  'LS',
  'SZ',
  'KE',
  'UG',
  'TZ',
  'NG',
  'GH',
  'GB',
  'US',
];

const REGION_NAMES: Intl.DisplayNames = new Intl.DisplayNames(['en'], {
  type: 'region',
});

/** ISO 3166-1 alpha-2 codes accepted by the backend's `@IsCountryCode`. */
export const COUNTRY_OPTIONS: SelectOption[] = COUNTRY_CODES.map(
  (code: string): SelectOption => ({
    value: code,
    label: REGION_NAMES.of(code) ?? code,
  }),
);
