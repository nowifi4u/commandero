/* eslint-disable @typescript-eslint/no-throw-literal */
import { isSafeInteger, toSafeInteger } from 'lodash';
import { CommanderoManager } from '../CommanderoManager';
import { BaseNumberType, BaseNumberTypeOptions } from './base/BaseNumber';

export interface LodashSafeIntegerTypeOptions<retT extends number, defT = never, infT extends boolean = false> extends BaseNumberTypeOptions<retT, defT, infT> {
  skipCheck?: boolean;
}

export class LodashSafeIntegerType<ctxT extends {}, retT extends number, defT = never, infT extends boolean = false> extends BaseNumberType<ctxT, retT, defT, infT> {
  declare public readonly options: LodashSafeIntegerTypeOptions<retT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: LodashSafeIntegerTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.LodashSafeInteger.typename ]]',
    });
  }

  public run (val: string): retT {
    const raw = Number(val);
    if (Number.isNaN(raw)) throw null;
    if (!this.options.skipCheck && !isSafeInteger(raw)) throw null;
    const int = toSafeInteger(raw);
    if (Number.isNaN(int)) throw null;
    return this.returnNumber(int);
  }
}
