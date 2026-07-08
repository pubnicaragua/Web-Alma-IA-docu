"use client";

import countries from "i18n-iso-countries";
import esLocale from "i18n-iso-countries/langs/es.json";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

countries.registerLocale(esLocale);

export type PhoneCountry = {
  code: CountryCode;
  name: string;
  dialCode: string;
};

const supportedCountries = getCountries();

export const PHONE_COUNTRIES: PhoneCountry[] = supportedCountries
  .map((code) => {
    const name =
      countries.getName(code, "es", { select: "official" }) ?? code;
    return {
      code,
      name,
      dialCode: getCountryCallingCode(code),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

export const DEFAULT_PHONE_COUNTRY_CODE: CountryCode = "CL";

export const getPhoneCountryByCode = (code: CountryCode) =>
  PHONE_COUNTRIES.find((country) => country.code === code) ??
  PHONE_COUNTRIES[0];
