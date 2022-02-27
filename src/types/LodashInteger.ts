/* eslint-disable @typescript-eslint/no-throw-literal */
import { isInteger, toInteger } from 'lodash';
import { CommandsManager } from '../CommandsManager';
import { BaseNumberType, BaseNumberTypeOptions } from './base/BaseNumber';

export interface LodashIntegerTypeOptions<retT extends number, defT = never, infT extends boolean = false> extends BaseNumberTypeOptions<retT, defT, infT> {
  skipCheck?: boolean;
}

export class LodashIntegerType<ctxT extends {}, retT extends number, defT = never, infT extends boolean = false> extends BaseNumberType<ctxT, retT, defT, infT> {
  declare public readonly options: LodashIntegerTypeOptions<retT, defT, infT>;

  public constructor (manager: CommandsManager<ctxT>, options: LodashIntegerTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.LodashInteger.typename ]]',
    });
  }

  public run (val: string): retT {
    const raw = Number(val);
    if (Number.isNaN(raw)) throw null;
    if (!this.options.skipCheck && !isInteger(raw)) throw null;
    const int = toInteger(raw);
    if (Number.isNaN(int)) throw null;
    return this.returnNumber(int);
  }
}
