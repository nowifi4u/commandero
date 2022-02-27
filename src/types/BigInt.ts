import { CommanderoManager } from '../CommanderoManager';
import { BaseType, BaseTypeOptions } from './base/Base';
import { MaxNumberUserError, MinNumberUserError, OneOfUserError } from './base/Errors';

export interface BigIntTypeOptions<retT extends BigInt, defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {
  min?: BigInt;
  max?: BigInt;
  oneOf?: retT[];
}

export class BigIntType<ctxT extends {}, retT extends BigInt, defT = never, infT extends boolean = false> extends BaseType<ctxT, retT, defT, infT> {
  declare public readonly options: BigIntTypeOptions<retT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: BigIntTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ types.BigInt.typemame ]]',
    });

    this.validate();
  }

  protected returnNumber (num: BigInt): retT {
    OneOfUserError.validate(num, this.options.oneOf);
    MinNumberUserError.validate(num, this.options.min);
    MaxNumberUserError.validate(num, this.options.max);
    return num as retT;
  }

  public run (val: string): retT {
    try {
      const int = BigInt(val);
      return this.returnNumber(int);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw null;
    }
  }

  public validate (): void {
    if (this.options.oneOf != null) {
      if (this.options.min != null) {
        for (const oneOf of this.options.oneOf) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          if (oneOf < this.options.min) throw new Error(`options.oneOf value (${oneOf}) is less than options.min (${this.options.min})`);
        }
      }
      if (this.options.max != null) {
        for (const oneOf of this.options.oneOf) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          if (oneOf > this.options.max) throw new Error(`options.oneOf value (${oneOf}) is more than options.max (${this.options.max})`);
        }
      }
    }
  }
}
