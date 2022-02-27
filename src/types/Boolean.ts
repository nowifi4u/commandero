/* eslint-disable @typescript-eslint/no-throw-literal */
import { CommanderoManager } from '../CommanderoManager';
import { BaseType, BaseTypeOptions } from './base/Base';

export interface BooleanTypeOptions<defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {
  truthy: Iterable<string>;
  falsy: Iterable<string>;
}

export class BooleanType<ctxT extends {}, defT = never, infT extends boolean = false> extends BaseType<ctxT, boolean, defT, infT> {
  declare public readonly options: BooleanTypeOptions<defT, infT>;

  public readonly truthy: Set<string>;
  public readonly falsy: Set<string>;

  public constructor (manager: CommanderoManager<ctxT>, options: BooleanTypeOptions<defT, infT>) {
    super(manager, options, {
      typename: '[[ types.Boolean.typename ]]',
    });

    this.truthy = new Set(options.truthy);
    this.falsy = new Set(options.falsy);
  }

  public run (val: string): boolean {
    const lval = val.toLowerCase();
    if (this.truthy.has(lval)) return true;
    if (this.falsy.has(lval)) return false;
    throw null;
  }
}
