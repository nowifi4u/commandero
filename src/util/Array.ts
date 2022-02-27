export type NonEmptyReadonlyArray<T = unknown> = [T, ...readonly T[]];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
export type ArrayMapCast<T, U> = T extends U ? T : U;

export type PromiseFulfilledReturnItem<T> = PromiseFulfilledResult<Awaited<T>>;
export type PromiseFulfilledReturn<Ts extends readonly unknown[] | []> = { -readonly [K in keyof Ts]: PromiseFulfilledResult<Ts[K]> };

export type PromiseRejectedReturn<Ts extends readonly unknown[] | []> = { -readonly [K in keyof Ts]: PromiseRejectedResult };

export type PromiseSettledResultItem<T> = PromiseSettledResult<Awaited<T>>;
export type PromiseSettledReturn<Ts extends readonly unknown[] | []> = { -readonly [K in keyof Ts]: PromiseSettledResultItem<Ts[K]> };
