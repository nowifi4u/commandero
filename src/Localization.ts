import * as lodash from 'lodash';
import * as IntlCanonicalLocales from '@formatjs/intl-getcanonicallocales';

export type LocaleConstructable = ConstructorParameters<typeof Locale>[0];

export class Locale {
  public readonly language: string;
  public readonly country?: string;

  constructor (locale: Locale | string) {
    if (locale instanceof Locale) {
      this.language = locale.language;
      this.country = locale.country;
    } else if (typeof locale === 'string') {
      [locale] = IntlCanonicalLocales.getCanonicalLocales(locale);
      [this.language, this.country] = locale.split('-');
    } else {
      throw TypeError('Invalid locale type');
    }
  }

  /**
   * Returns a string value of the locale.
   */
  public toString (): string {
    if (this.country != null) {
      return `${this.language}-${this.country}`;
    }

    return this.language;
  }

  /**
   * Returns all string value variants of the locale.
   */
  public getVariants (): string[] {
    const dash = this.toString();

    return [
      dash,
      dash.toLowerCase(),
      dash.toUpperCase(),
      this.language.toUpperCase(),
    ];
  }

  /**
   * Returns if a given locale is equal to the locale.
   * @param strict - Should locale's language not be checked if locale is not found
   */
  public equals (locale: LocaleConstructable, strict = false): boolean {
    locale = new Locale(locale);

    if (strict) {
      return locale.toString() === this.toString();
    } else {
      return locale.language === this.language;
    }
  }
}

export function makeLocaleSafe (locale: LocaleConstructable): Locale;
export function makeLocaleSafe (locale: undefined): undefined;
export function makeLocaleSafe (locale: LocaleConstructable | undefined): Locale | undefined;
export function makeLocaleSafe (locale: LocaleConstructable | undefined): Locale | undefined {
  if (locale == null) return undefined;
  return new Locale(locale);
}

export function makeLocaleNameSafe (locale: LocaleConstructable): string;
export function makeLocaleNameSafe (locale: undefined): undefined;
export function makeLocaleNameSafe (locale: LocaleConstructable | undefined): string | undefined;
export function makeLocaleNameSafe (locale: LocaleConstructable | undefined): string | undefined {
  if (locale == null) return undefined;
  return new Locale(locale).toString();
}

export interface LocalizationOptions {
  defaultLocale: LocaleConstructable;
  boundsParam?: [string, string];
  boundsKey?: [string, string];
}

export type ParameterType =
  | string
  | ((locale: LocaleConstructable | undefined, key: string, match: string, localization: Localization) => string);

export type ParametersType = Record<string, ParameterType>;

export interface TranslateRawOptions {
  strictLocale?: boolean;
}

export interface TranslateOtherOptions {
  params?: ParametersType;
  maxKeyDepth?: number;
  disableKey?: boolean;
}

export interface TranslateOptions extends TranslateRawOptions, TranslateOtherOptions {}

export interface LocaleDictionary {
  [key: string]: string | LocaleDictionary;
}

export const LocalizationRegExpObject = /\{\{\s*([\w]+)\s*}\}/;
export const LocalizationRegExpKey = /\[\[\s*([\w.]+)\s*\[\[/;

export class Localization {
  public readonly defaultLocale: string;
  public maxKeyDepth: number;

  /**
   * Map of locales to dictionaries
   */
  public readonly dicts: Map<string, LocaleDictionary> = new Map();

  public constructor (options: LocalizationOptions, maxKeyDepth: number = 16) {
    this.defaultLocale = new Locale(options.defaultLocale).toString();
    this.maxKeyDepth = maxKeyDepth;
  }

  /**
   * Returns a string value of a given locale.
   */
  public getLocaleName (locale: LocaleConstructable): string {
    return new Locale(locale).toString();
  }

  /**
   * Returns all string value variants of a given locale.
   */
  public getLocaleVariants (locale: LocaleConstructable): string[] {
    return new Locale(locale).getVariants();
  }

  /**
   * Returns a dictionary for a given locale.
   * @param strict - Should locale's language not be checked if locale is not found
   */
  public getDict (locale: LocaleConstructable, strict = false): LocaleDictionary | undefined {
    locale = new Locale(locale);
    let dict = this.dicts.get(locale.toString());

    if (dict == null && !strict) {
      dict = this.dicts.get(locale.language);
    }

    return dict;
  }

  /**
   * Returns a dictionary for a given locale.
   * In not found, returns a dictionary for defaultLocale.
   * @param strict - Should locale's language not be checked if locale is not found
   */
  public getDictSafe (locale: LocaleConstructable | undefined, strict = false): LocaleDictionary | undefined {
    let dict;
    if (locale != null) {
      dict = this.getDict(locale, strict);
    }

    if (dict == null) {
      dict = this.dicts.get(this.defaultLocale);
    }

    return dict;
  }

  /**
   * Checks if a dictionary exists for a given locale.
   * @param strict - Should locale's language not be checked if locale is not found
   */
  public hasDict (locale: LocaleConstructable, strict = false): boolean {
    locale = new Locale(locale);

    return this.dicts.has(locale.toString()) &&
      (!strict && this.dicts.has(locale.language));
  }

  public hasDictKey (locale: LocaleConstructable, key: string, strict = false): boolean {
    locale = new Locale(locale);
    const dict = this.getDict(locale, strict);
    return lodash.has(dict, key);
  }

  public hasDictKeySafe (locale: LocaleConstructable, key: string, strict = false): boolean {
    locale = new Locale(locale);
    const dict = this.getDictSafe(locale, strict);
    return lodash.has(dict, key);
  }

  public listDictLocales (): string[] {
    return Array.from(this.dicts.keys());
  }

  /**
   * Sets a dictionary for a given locale.
   * Uses defaultLocale's dictionary as basis.
   * @param pure - Should an empty object be used as a basis for creating dictionary
   */
  public addDict (locale: LocaleConstructable, dict: LocaleDictionary, pure = false): void {
    const localeName = this.getLocaleName(locale);
    const baseDict: LocaleDictionary = pure ? {} : this.dicts.get(this.defaultLocale) ?? {};
    const newDict = mergeDicts({}, baseDict, dict);
    this.dicts.set(localeName, newDict);
  }

  /**
   * Merges a dictionary into a given locale.
   * Creates a dictionary is no exists.
   * @param pure - Should an empty object be used as a basis for creating dictionary
   */
  public mergeDict (locale: LocaleConstructable, dict: LocaleDictionary, pure = false): void {
    const localeName = this.getLocaleName(locale);
    if (!this.dicts.has(localeName)) return this.addDict(locale, dict, pure);

    lodash.merge(this.dicts.get(localeName), dict);
  }

  /**
   * Deletes a dictionary for a given locale.
   */
  public deleteDict (locale: LocaleConstructable): boolean {
    const localeName = this.getLocaleName(locale);
    return this.dicts.delete(localeName);
  }

  /**
   * Returns a string representation of a Date for a given locale.
   */
  public date (locale: LocaleConstructable, value: Date | number | undefined, options?: Intl.DateTimeFormatOptions): string {
    const localeName = this.getLocaleName(locale);
    const intl = new Intl.DateTimeFormat([localeName, this.defaultLocale], options);
    return intl.format(value);
  }

  /**
   * Returns a string representation of a number for a given locale.
   */
  public number (locale: LocaleConstructable, value: number, options?: Intl.NumberFormatOptions): string {
    const localeName = this.getLocaleName(locale);
    const intl = new Intl.NumberFormat([localeName, this.defaultLocale], options);
    return intl.format(value);
  }

  /**
   * Returns a string representation of a currency for a given locale an currency.
   */
  public currency (locale: LocaleConstructable, value: number, currency: string, options?: Exclude<Intl.NumberFormatOptions, ['style', 'currency']>): string {
    options = {
      ...options,
      style: 'currency',
      currency,
    };

    return this.number(locale, value, options);
  }

  /**
   * An overwritable handler for recursive translation handling.
   */
  public translateKeyHandler (_locale: Locale | undefined, value: string | undefined, key: string, match: string | undefined): string {
    return value ?? match ?? key;
  }

  /**
   * An overwritable handler for translation handling.
   */
  public translateParamHandler (locale: Locale | undefined, value: ParameterType | undefined, key: string, match: string): string {
    if (typeof value === 'function') return value(locale, key, match, this);
    return value ?? match ?? key;
  }

  protected _translateRaw (locale: Locale | undefined, key: string, options: TranslateRawOptions = {}): string | undefined {
    const dict = this.getDictSafe(locale, options.strictLocale);
    if (dict == null) return undefined;

    const val = lodash.get(dict, key);
    return typeof val === 'string' ? val : undefined;
  }

  /**
   * Returns a raw translation for a given key to a given locale.
   */
  public translateRaw (locale: LocaleConstructable | undefined, key: string, options: TranslateRawOptions = {}): string | undefined {
    locale = locale != null ? new Locale(locale) : undefined;
    return this._translateRaw(locale, key, options);
  }

  public _translateOther (locale: Locale | undefined, localeName: string | undefined, text: string, options: TranslateOtherOptions = {}, depth = this.maxKeyDepth): string {
    if (!options.disableKey) {
      text = text.replace(LocalizationRegExpKey, (m: string, k: string) => {
        const val = this._translate(locale, localeName, k, options, depth);
        return this.translateKeyHandler(locale, val, k, m);
      });
    }
    const params = options.params;
    if (params != null) {
      text = text.replace(LocalizationRegExpObject, (m: string, k: string) => {
        const val = params[k];
        return this.translateParamHandler(locale, val, k, m);
      });
    }

    return text;
  }

  public translateOther (locale: LocaleConstructable | undefined, text: string, options: TranslateOtherOptions = {}): string {
    locale = makeLocaleSafe(locale);
    return this._translateOther(locale, makeLocaleNameSafe(locale), text, options, options.maxKeyDepth ?? this.maxKeyDepth);
  }

  protected _translate (locale: Locale | undefined, localeName: string | undefined, key: string, options: TranslateOptions = {}, depth = this.maxKeyDepth): string | undefined {
    if (depth < 1) return undefined;
    const value = this._translateRaw(locale, key, options);
    if (value == null) return this.translateKeyHandler(locale, undefined, key, undefined);

    return this._translateOther(locale, localeName, value, options, depth);
  }

  /**
   * Translates a given key to a given localization
   */
  public translate (locale: LocaleConstructable | undefined, key: string, options: TranslateOptions = {}): string | undefined {
    locale = makeLocaleSafe(locale);
    return this._translate(locale, makeLocaleNameSafe(locale), key, options, options.maxKeyDepth ?? this.maxKeyDepth);
  }

  public _translateOtherUnsafe (locale: Locale | undefined, localeName: string | undefined, text: string, options: TranslateOtherOptions = {}, depth = this.maxKeyDepth): string {
    const params = options.params;
    if (params != null) {
      text = text.replace(LocalizationRegExpObject, (m: string, k: string) => {
        const val = params[k];
        return this.translateParamHandler(locale, val, k, m);
      });
    }
    if (!options.disableKey) {
      text = text.replace(LocalizationRegExpKey, (m: string, k: string) => {
        const val = this._translateOtherUnsafe(locale, localeName, k, options, depth);
        return this.translateKeyHandler(locale, val, k, m);
      });
    }

    return text;
  }

  public translateOtherUnsafe (locale: LocaleConstructable | undefined, text: string, options: TranslateOtherOptions = {}): string {
    locale = makeLocaleSafe(locale);
    return this._translateOtherUnsafe(locale, makeLocaleNameSafe(locale), text, options, options.maxKeyDepth ?? this.maxKeyDepth);
  }

  protected _translateUnsafe (locale: Locale | undefined, localeName: string | undefined, key: string, options: TranslateOptions = {}, depth = this.maxKeyDepth): string | undefined {
    if (depth < 1) return undefined;
    const value = this._translateRaw(locale, key, options);
    if (value == null) return this.translateKeyHandler(locale, undefined, key, undefined);

    return this._translateOtherUnsafe(locale, localeName, value, options, depth);
  }

  /**
   * Translates a given key to a given localization
   */
  public translateUnsafe (locale: LocaleConstructable | undefined, key: string, options: TranslateOptions = {}): string | undefined {
    locale = makeLocaleSafe(locale);
    return this._translateUnsafe(locale, makeLocaleNameSafe(locale), key, options, options.maxKeyDepth ?? this.maxKeyDepth);
  }

  /**
   * Binds a locale to Localization as a first argument of all methods
   */
  public bind (locale: LocaleConstructable): LocalizationLocale {
    if (!this.hasDict(locale)) locale = this.defaultLocale;

    return new LocalizationLocale(this, locale);
  }
}

export class LocalizationLocale {
  public readonly localization: Localization;
  public readonly locale: Locale;

  public constructor (localization: Localization, locale: LocaleConstructable) {
    this.localization = localization;
    this.locale = new Locale(locale);
  }

  /**
   * Returns a string value of the locale.
   */
  public getLocaleName (): string {
    return this.locale.toString();
  }

  /**
   * Returns all string value variants of the locale.
   */
  public getLocaleVariants (): string[] {
    return this.locale.getVariants();
  }

  public getDict (strict = false): LocaleDictionary | undefined {
    return this.localization.getDict(this.locale, strict);
  }

  public getDictSafe (strict = false): LocaleDictionary | undefined {
    return this.localization.getDictSafe(this.locale, strict);
  }

  public hasDict (strict = false): boolean {
    return this.localization.hasDict(this.locale, strict);
  }

  public addDict (dict: LocaleDictionary): void {
    return this.localization.addDict(this.locale, dict);
  }

  public mergeDict (dict: LocaleDictionary): void {
    return this.localization.mergeDict(this.locale, dict);
  }

  public deleteDict (): boolean {
    return this.localization.deleteDict(this.locale);
  }

  public date (value: Date | number | undefined, options?: Intl.DateTimeFormatOptions): string {
    return this.localization.date(this.locale, value, options);
  }

  public number (value: number, options?: Intl.NumberFormatOptions): string {
    return this.localization.number(this.locale, value, options);
  }

  public currency (value: number, currency: string, options?: Exclude<Intl.NumberFormatOptions, ['style', 'currency']>): string {
    return this.localization.currency(this.locale, value, currency, options);
  }

  public translateRaw (key: string, options: TranslateRawOptions = {}): string | undefined {
    return this.localization.translateRaw(this.locale, key, options);
  }

  public translateOther (text: string, options: TranslateOtherOptions = {}): string {
    return this.localization.translateOther(this.locale, text, options);
  }

  public translate (key: string, options: TranslateOptions = {}): string | undefined {
    return this.localization.translate(this.locale, key, options);
  }

  public translateOtherUnsafe (text: string, options: TranslateOtherOptions = {}): string {
    return this.localization.translateOtherUnsafe(this.locale, text, options);
  }

  public translateUnsafe (key: string, options: TranslateOptions = {}): string | undefined {
    return this.localization.translateUnsafe(this.locale, key, options);
  }
}

class DictionaryMergeError extends Error {}

export function mergeDicts (...sources: LocaleDictionary[]): LocaleDictionary {
  const result: LocaleDictionary = {};
  for (const source of sources) {
    if (source == null || typeof source !== 'object') continue;
    for (const key in source) {
      const val = source[key];
      const rval = result[key];
      if (val != null && typeof val === 'object') {
        if (rval != null && typeof rval !== 'object') throw new DictionaryMergeError(`Key ${key} contains a string "${rval}" in result and an object in source`);
        result[key] = mergeDicts(rval, val);
      } else {
        if (typeof val !== 'string') throw new Error('Dict cannot contain non-string values');
        if (rval != null && typeof rval === 'object') throw new DictionaryMergeError(`Key ${key} contains an object in result and an string "${val}" in source`);
        result[key] = val;
      }
    }
  }
  return result;
}

export interface ILocale {
  locale: string;
}

export class LocalizationKeyError extends Error {
  public constructor (key: string) {
    super(`Localization key ${key} not found`);
  }
}
