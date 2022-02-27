export interface IMin {
  min: number;
  max?: number;
}

export interface IMax {
  min?: number;
  max: number;
}

export type IMinMax = IMin | IMax;

export interface INoInfinite {
  infinite?: never | false;
}

export interface IMinNoInf extends IMin, INoInfinite {}
export interface IMaxNoInf extends IMax, INoInfinite {}

export interface INoMinMax {
  min?: never;
  max?: never;
}

export interface IInfinite extends INoMinMax {
  infinite?: boolean;
}

export type IMinMaxInfinite = IMinNoInf | IMaxNoInf | IInfinite;

export function checkMin (num: number, options: IMinMax | IMinMaxInfinite): boolean {
  return options.min == null || num >= options.min;
}

export function checkMax (num: number, options: IMinMax | IMinMaxInfinite): boolean {
  return options.max == null || num <= options.max;
}

export function checkMinMax (num: number, options: IMinMax | IMinMaxInfinite): boolean {
  return checkMin(num, options) && checkMax(num, options);
}

export function min (...values: Array<number | undefined>): number | undefined {
  let currentMin: number | undefined;
  for (const value of values) {
    if (value != null && (currentMin == null || value < currentMin)) {
      currentMin = value;
    }
  }
  return currentMin;
}

export function max (...values: Array<number | undefined>): number | undefined {
  let currentMax: number | undefined;
  for (const value of values) {
    if (value != null && (currentMax == null || value > currentMax)) {
      currentMax = value;
    }
  }
  return currentMax;
}
