import { isPromise } from 'util/types';
import * as util from 'util';

export type ArgsFunction<argsT extends readonly unknown[], retT> = (...args: argsT) => retT;
export type ArgsAsyncFunction<argsT extends readonly unknown[], retT> = (...args: argsT) => Promise<retT>;

export type ResolvableValue<T, argsT extends readonly unknown[] = any[]> = T | Promise<T> | ArgsFunction<argsT, T> | ArgsAsyncFunction<argsT, T>;

export async function resolveValue<T, argsT extends readonly unknown[]> (value: ResolvableValue<T>, ...args: argsT): Promise<T> {
  if (value == null) return value;
  value = await Promise.resolve(value);
  // @ts-expect-error
  if (typeof value === 'function') value = await value(...args);
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/return-await
  return value;
}

export class NeverError extends Error {
  public constructor (value: never) {
    super(`Unreachable statement: ${String(value)}`);
  }
}

// This returns Object.prototype in order to return a valid object
// without creating a new one each time this is called just to discard it the moment after.
const isConstructorProxyHandler = {
  construct () {
    return Object.prototype;
  },
};

export function isConstructor (func: any, _class?: any): boolean {
  if (_class == null) return true;
  try {
    // eslint-disable-next-line no-new
    new new Proxy(func, isConstructorProxyHandler)();
    return func.prototype instanceof _class;
  } catch (err) {
    return false;
  }
}

export function isTypeof (value: any, type: any, _typeof = typeof value): boolean {
  if (isConstructor(type)) return value instanceof type;
  switch (type) {
    case 'array':
      return Array.isArray(value);
    case 'promise':
      return isPromise(value);
    default:
      return _typeof === type;
  }
}

export function isTypeofs (value: any, types: any[], _typeof = typeof value): boolean {
  return types.some(type => isTypeof(value, type, _typeof));
}

export function ensureArray<T> (value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  return [value];
}

export function toStringInspect (object: any, opts: util.InspectOptions = {}): string {
  return util.inspect(object, opts);
}

export type NoInfer<T> = [T][T extends any ? 0 : never];

export function resolveOptionOverrides (overrides: Array<(boolean | undefined)>, def: boolean): boolean;
export function resolveOptionOverrides (overrides: Array<(boolean | undefined)>): boolean | undefined;
export function resolveOptionOverrides (overrides: boolean[]): boolean;
export function resolveOptionOverrides (overrides: Array<(boolean | undefined)>, def?: boolean): boolean | undefined {
  let result = def;
  for (const override of overrides) {
    if (override != null) result = override;
  }
  return result;
}

export async function sleep (ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export type PossiblePromise<T> = T | Promise<T>;
