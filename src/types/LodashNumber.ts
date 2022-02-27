/* eslint-disable @typescript-eslint/no-throw-literal */
import { isNumber, toNumber } from 'lodash';
import { CommanderoManager } from '../CommanderoManager';
import { BaseNumberType, BaseNumberTypeOptions } from './base/BaseNumber';

export interface NumberTypeOptions<retT extends number, defT = never, infT extends boolean = false> extends BaseNumberTypeOptions<retT, defT, infT> {
  skipCheck?: boolean;
  includePositiveInfinity?: boolean;
  includeNegativeInfinity?: boolean;
}

export class LodashNumberType<ctxT extends {}, retT extends number, defT = never, infT extends boolean = false> extends BaseNumberType<ctxT, retT, defT, infT> {
  declare public readonly options: NumberTypeOptions<retT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: NumberTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.LodashNumber.typename ]]',
    });
  }

  public run (val: string): retT {
    const raw = Number(val);
    if (Number.isNaN(raw)) throw null;
    if (!this.options.skipCheck && !isNumber(raw)) throw null;
    const num = toNumber(raw);
    if (Number.isNaN(num)) throw null;
    if (!this.options.includeNegativeInfinity && num === -Infinity) throw null;
    if (!this.options.includePositiveInfinity && num === Infinity) throw null;
    return this.returnNumber(num);
  }
}
