/* eslint-disable @typescript-eslint/no-throw-literal */
import { IsInstance } from 'class-validator';
import { ArgumentExtractor } from '../../arguments/extractors/base';
import { CommanderoManager } from '../../CommanderoManager';
import { ArrayMapCast, PromiseSettledReturn } from '../../util/Array';
import { isUserError, MultipleErrorsError, NoDefaultError } from './Errors';

export interface BaseTypeOptions<defT = never, infT extends boolean = false> {
  name?: string;
  typename?: string;

  default?: defT;
  defaultOnUserError?: boolean;
  infinite?: infT;
  infiniteIgnoreUserErrors?: boolean;
  extractor?: ArgumentExtractor;
}

export interface BaseTypeDefaultOptions {
  typename: string;
}

export type UnknownBaseTypeOptions = BaseTypeOptions<unknown, boolean>;

export type BaseTypeOptionsExtractDefT<optsT extends UnknownBaseTypeOptions> =
  optsT extends BaseTypeOptions<infer defT, boolean>
    ? defT
    : never;

export type BaseTypeOptionsExtractDefTs<optsTs extends UnknownBaseTypeOptions[]> = {
  [K in keyof optsTs]: BaseTypeOptionsExtractDefT<ArrayMapCast<optsTs[K], UnknownBaseTypeOptions>>;
};

export type BaseTypeOptionsExtractInfT<optsT extends UnknownBaseTypeOptions> =
  optsT extends BaseTypeOptions<unknown, infer infT>
    ? infT
    : never;

export type BaseTypeOptionsExtractInfTs<optsTs extends UnknownBaseTypeOptions[]> = {
  [K in keyof optsTs]: BaseTypeOptionsExtractInfT<ArrayMapCast<optsTs[K], UnknownBaseTypeOptions>>;
};

export abstract class BaseType<ctxT extends {}, retT, defT = never, infT extends boolean = false> implements BaseTypeDefaultOptions {
  @IsInstance(CommanderoManager)
  public readonly manager: CommanderoManager<ctxT>;

  public readonly options: BaseTypeOptions<defT, infT>;

  public readonly typename: string;

  public constructor (manager: CommanderoManager<ctxT>, options: BaseTypeOptions<defT, infT>, defaultOptions: BaseTypeDefaultOptions) {
    this.manager = manager;
    this.options = options;

    this.typename = options.typename ?? defaultOptions.typename;
  }

  public abstract run (val: string, context: ctxT): retT | Promise<retT>;

  public isEmpty (val: string, context: ctxT): boolean | Promise<boolean>;
  public isEmpty (val: string): boolean {
    return val.length === 0;
  }

  public async runAll (vals: string[], context: ctxT): Promise<PromiseSettledReturn<retT[]>> {
    return await Promise.allSettled(vals.map(val => this.run(val, context)));
  }

  public async handleValue (val: string | undefined, context: ctxT): Promise<retT | defT> {
    if (val == null || await this.isEmpty(val, context)) {
      return this.returnDefault();
    }
    try {
      return await this.run(val, context);
    } catch (err) {
      if (this.options.defaultOnUserError && !isUserError(err)) return this.returnDefault();
      throw err;
    }
  }

  public async handleValues (vals: string[], context: ctxT): Promise<PromiseSettledReturn<retT[]>> {
    const results = await this.runAll(vals, context);
    const criticalErrors = results.filter(function (result): result is PromiseRejectedResult {
      return result.status === 'rejected' && !isUserError(result.reason);
    });
    if (criticalErrors.length > 0) throw new MultipleErrorsError(criticalErrors);
    return results;
  }

  public returnDefault (): defT {
    if (typeof this.options.default === 'undefined') throw new NoDefaultError();
    return this.options.default;
  }
}

export type UnknownBaseType<ctxT extends {}> = BaseType<ctxT, unknown, unknown, boolean>;
export type UnknownNoDefaultBaseType<ctxT extends {}> = BaseType<ctxT, unknown, never, boolean>;

export type BaseTypeExtractDefT<ctxT extends {}, argT extends UnknownBaseType<ctxT>> =
  argT extends BaseType<{}, unknown, infer defT, boolean>
    ? defT
    : never;

export type BaseTypeExtractDefTs<ctxT extends {}, argTs extends ReadonlyArray<UnknownBaseType<ctxT>>> = {
  [K in keyof argTs]: BaseTypeExtractDefT<ctxT, ArrayMapCast<argTs[K], UnknownBaseType<ctxT>>>;
};

export type BaseTypeExtractInfT<ctxT extends {}, argT extends UnknownBaseType<ctxT>> =
  argT extends BaseType<{}, unknown, unknown, infer infT>
    ? infT
    : never;

export type BaseTypeExtractInfTs<ctxT extends {}, argTs extends ReadonlyArray<UnknownBaseType<ctxT>>> = {
  [K in keyof argTs]: BaseTypeExtractInfT<ctxT, ArrayMapCast<argTs[K], UnknownBaseType<ctxT>>>;
};

export type BaseTypeCalculateReturnT<retT, defT = never, infT extends boolean = false> =
  | (defT extends never ? never : defT)
  | (infT extends true ? retT[]
    : infT extends false ? retT
      : retT | retT[]);

export type BaseTypeExtractReturnT<ctxT extends {}, argT extends UnknownBaseType<ctxT>> =
  argT extends BaseType<{}, infer retT, infer defT, infer infT>
    ? BaseTypeCalculateReturnT<retT, defT, infT>
    : never;

export type BaseTypeExtractReturnTs<ctxT extends {}, argTs extends ReadonlyArray<UnknownBaseType<ctxT>>> = {
  [K in keyof argTs]: BaseTypeExtractReturnT<ctxT, ArrayMapCast<argTs[K], UnknownBaseType<ctxT>>>;
};

// interface testI<defT> {
//   default?: defT;
// }

// type testExtractDefT<I extends testI<unknown>> = I extends testI<infer defT> ? defT : never;
// type testExtractedDefT = testExtractDefT<testI<never>>;

// type testArgT = BaseTypeCalculateReturnT<boolean, never, true>;
// type testRetT = BaseTypeCalculateReturnT<BaseType<{}, boolean, never, true>>;
