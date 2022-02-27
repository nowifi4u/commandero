import { CommandsManager } from '../../CommandsManager';
import { PromiseFulfilledReturn } from '../../util/Array';
import { BaseType, BaseTypeOptions } from '../base/Base';
import { MultipleErrorsUserError } from '../base/Errors';

export interface MultipleAllTypeOptions<ctxT extends {}, argT extends BaseType<ctxT, retT, defT, false>, retT, defT = never> extends BaseTypeOptions<defT, false> {
  type: argT;
  separator?: string | RegExp;
  limit?: number;
  ignoreErrors?: boolean;
}

export class MultipleAllType<ctxT extends {}, argT extends BaseType<ctxT, retT, defT, false>, retT, defT = never> extends BaseType<ctxT, retT[], defT, false> {
  declare public readonly options: MultipleAllTypeOptions<ctxT, argT, retT, defT>

  public constructor (manager: CommandsManager<ctxT>, options: MultipleAllTypeOptions<ctxT, argT, retT, defT>) {
    super(manager, options, {
      typename: `[[ type.Multiple.multiple ]] ${options.type.typename}`,
    });
  }

  public async run (val: string, context: ctxT): Promise<retT[]> {
    const separator = this.options.separator ?? ' ';
    const values = val.split(separator, this.options.limit);
    let results = await this.options.type.runAll(values, context);
    const errors = results.filter(result => result.status === 'rejected');
    if (errors.length > 0) {
      if (!this.options.ignoreErrors) throw new MultipleErrorsUserError(errors);
      results = results.filter(result => result.status === 'fulfilled');
    }
    return (results as PromiseFulfilledReturn<retT[]>).map(result => result.value);
  }
}
