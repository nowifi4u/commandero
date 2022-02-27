/* eslint-disable @typescript-eslint/no-throw-literal */
import { CommanderoManager } from '../CommanderoManager';
import { BaseNumberType, BaseNumberTypeOptions } from './base/BaseNumber';

export interface IntegerTypeOptions<retT extends number, defT = never, infT extends boolean = false> extends BaseNumberTypeOptions<retT, defT, infT> {
  radix?: number;
  skipCheck?: boolean;
}

export class IntegerType<ctxT extends {}, retT extends number, defT = never, infT extends boolean = false> extends BaseNumberType<ctxT, retT, defT, infT> {
  declare public readonly options: IntegerTypeOptions<retT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: IntegerTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.Integer.typename ]]',
    });
  }

  public run (val: string): retT {
    const int = Number.parseInt(val, this.options.radix);
    if (Number.isNaN(int)) throw null;
    if (!this.options.skipCheck && val.toUpperCase() !== String(int).toUpperCase()) throw null;
    return this.returnNumber(int);
  }
}
