/* eslint-disable @typescript-eslint/no-throw-literal */
import { isLength, toLength } from 'lodash';
import { CommanderoManager } from '../CommanderoManager';
import { BaseNumberType, BaseNumberTypeOptions } from './base/BaseNumber';

export interface LodashLengthTypeOptions<retT extends number, defT = never, infT extends boolean = false> extends BaseNumberTypeOptions<retT, defT, infT> {
  skipCheck?: boolean;
}

export class LodashLengthType<ctxT extends {}, retT extends number, defT = never, infT extends boolean = false> extends BaseNumberType<ctxT, retT, defT, infT> {
  declare public readonly options: LodashLengthTypeOptions<retT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: LodashLengthTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.LodashLength.typename ]]',
    });
  }

  public run (val: string): retT {
    const raw = Number(val);
    if (Number.isNaN(raw)) throw null;
    if (!this.options.skipCheck && !isLength(raw)) throw null;
    const len = toLength(raw);
    return this.returnNumber(len);
  }
}
