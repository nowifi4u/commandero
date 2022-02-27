/* eslint-disable @typescript-eslint/no-throw-literal */
import { BaseType, BaseTypeExtractReturnTs, BaseTypeExtractInfTs, BaseTypeOptions, UnknownNoDefaultBaseType } from '../base/Base';
import { ArrayElement } from '../../util/Array';
import { UserError } from '../../Errors';
import { CommandsManager } from '../../CommandsManager';

// export type UnionTypeBaseOptions<infTs extends readonly boolean[], _R extends readonly unknown[] = []> =
//   infTs extends [infer infHead, ...infer infTail]
//     ? infHead extends boolean
//       ? infTail extends boolean[]
//         ? UnionTypeBaseOptions<infTail, [..._R, BaseTypeOptions<never, infHead>]>
//         : _R
//       : _R
//     : _R;

// export type UnionTypeTypes<retTs extends readonly unknown[], optsTs extends readonly unknown[], infTs extends readonly boolean[], _R extends readonly unknown[] = []> =
//   retTs extends [infer retHead, ...infer retTail]
//     ? optsTs extends [infer optsHead, ...infer optsTail]
//       ? infTs extends [infer infHead, ...infer infTail]
//         ? infTail extends boolean[]
//           ? UnionTypeTypes<retTail, optsTail, infTail, [..._R, BaseType<retHead, optsHead, infHead>]>
//           : _R
//         : _R
//       : _R
//     : _R;

export type UnionTypeInfReduce<ctxT extends {}, argTs extends ReadonlyArray<UnknownNoDefaultBaseType<ctxT>>> = ArrayElement<BaseTypeExtractInfTs<ctxT, argTs>>;
export type UnionTypeArgReduce<ctxT extends {}, argTs extends ReadonlyArray<UnknownNoDefaultBaseType<ctxT>>> = ArrayElement<BaseTypeExtractReturnTs<ctxT, argTs>>;

export interface UnionTypeOptions<ctxT extends {}, argTs extends ReadonlyArray<UnknownNoDefaultBaseType<ctxT>>, defT = never> extends BaseTypeOptions<defT, UnionTypeInfReduce<ctxT, argTs>> {
  types: argTs;
}

export class UnionType<ctxT extends {}, argTs extends ReadonlyArray<UnknownNoDefaultBaseType<ctxT>> | [], defT = never> extends BaseType<ctxT, UnionTypeArgReduce<ctxT, argTs>, defT, UnionTypeInfReduce<ctxT, argTs>> {
  declare public readonly options: UnionTypeOptions<ctxT, argTs, defT>

  public constructor (manager: CommandsManager<ctxT>, options: UnionTypeOptions<ctxT, argTs, defT>) {
    const typename = options.types.map(type => type.typename).join(' | ');

    super(manager, options, {
      typename,
    });
  }

  public async run (val: string, context: ctxT): Promise<UnionTypeArgReduce<ctxT, argTs>> {
    for (const type of this.options.types) {
      try {
        const result = await type.run(val, context);
        return result as UnionTypeArgReduce<ctxT, argTs>;
      } catch (err) {
        if (err != null && !(err instanceof UserError)) throw err;
        // Continue the loop
      }
    }
    throw null;
  }
}
