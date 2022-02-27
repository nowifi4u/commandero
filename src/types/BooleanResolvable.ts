import { CommanderoManager } from '../CommanderoManager';
import { BaseType, BaseTypeOptions } from './base/Base';

export type ResolvableStringArray<ctxT extends {}> = (val: string, context: ctxT) => boolean | Promise<boolean>;

export interface BooleanResolvableTypeOptions<ctxT extends {}, defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {
  resolver: ResolvableStringArray<ctxT>;
}

export class BooleanResolvableType<ctxT extends {}, defT = never, infT extends boolean = false> extends BaseType<ctxT, boolean, defT, infT> {
  declare public readonly options: BooleanResolvableTypeOptions<ctxT, defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: BooleanResolvableTypeOptions<ctxT, defT, infT>) {
    super(manager, options, {
      typename: '[[ type.BooleanResolvable.typename ]]',
    });
  }

  public async run (val: string, context: ctxT): Promise<boolean> {
    const lval = val.toLowerCase();
    return await this.options.resolver(lval, context);
  }
}
