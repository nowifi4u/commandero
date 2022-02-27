/* eslint-disable @typescript-eslint/no-throw-literal */
import { CommandsManager } from '../../CommandsManager';
import { BaseType, BaseTypeDefaultOptions, BaseTypeOptions } from './Base';
import { MaxNumberUserError, MinNumberUserError, OneOfUserError } from './Errors';

export interface BaseNumberTypeOptions<retT extends number, defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {
  min?: number;
  max?: number;
  oneOf?: retT[];
}

export abstract class BaseNumberType<ctxT extends {}, retT extends number, defT = never, infT extends boolean = false> extends BaseType<ctxT, retT, defT, infT> {
  declare public readonly options: BaseNumberTypeOptions<retT, defT, infT>;

  public constructor (manager: CommandsManager<ctxT>, options: BaseNumberTypeOptions<retT, defT, infT>, defaultOptions: BaseTypeDefaultOptions) {
    super(manager, options, defaultOptions);

    this.validate();
  }

  protected returnNumber (num: number): retT {
    OneOfUserError.validate(num, this.options.oneOf);
    MinNumberUserError.validate(num, this.options.min);
    MaxNumberUserError.validate(num, this.options.max);
    return num as retT;
  }

  public validate (): void {
    if (this.options.oneOf != null) {
      if (this.options.min != null) {
        for (const oneOf of this.options.oneOf) {
          if (oneOf < this.options.min) throw new Error(`options.oneOf value (${oneOf}) is less than options.min (${this.options.min})`);
        }
      }
      if (this.options.max != null) {
        for (const oneOf of this.options.oneOf) {
          if (oneOf > this.options.max) throw new Error(`options.oneOf value (${oneOf}) is more than options.max (${this.options.max})`);
        }
      }
    }
  }
}
