import { CommanderoManager } from '../CommanderoManager';
import { BaseType, BaseTypeOptions } from './base/Base';
import { MaxLengthUserError, MinLengthUserError, OneOfUserError } from './base/Errors';

export interface StringTypeOptions<retT extends string, defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {
  oneOf?: retT[];
  minLength?: number;
  maxLength?: number;
}

export class StringType<ctxT extends {}, retT extends string, defT = never, infT extends boolean = false> extends BaseType<ctxT, retT, defT, infT> {
  declare public readonly options: StringTypeOptions<retT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: StringTypeOptions<retT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.String.typename ]]',
    });

    this.validate();
  }

  public run (val: string): retT {
    OneOfUserError.validate(val, this.options.oneOf);
    MinLengthUserError.validate(val, this.options.minLength);
    MaxLengthUserError.validate(val, this.options.maxLength);
    return val as retT;
  }

  public validate (): void {
    if (this.options.oneOf != null) {
      if (this.options.minLength != null) {
        for (const oneOf of this.options.oneOf) {
          if (oneOf.length < this.options.minLength) throw new Error(`options.oneOf value (${oneOf}) length (${oneOf.length}) is less than options.minLength (${this.options.minLength})`);
        }
      }
      if (this.options.maxLength != null) {
        for (const oneOf of this.options.oneOf) {
          if (oneOf.length > this.options.maxLength) throw new Error(`options.oneOf value (${oneOf}) length (${oneOf.length}) is more than options.maxLength (${this.options.maxLength})`);
        }
      }
    }
  }
}
