export function isObject (obj: any): boolean {
  if (obj === undefined || obj === null) return false;
  if (typeof obj !== 'object') return false;
  if (Array.isArray(obj)) return false;
  return true;
}

export function hasOwnProperty (target: any, key: any): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

export type MapperType<T, nT> = (val: T, key?: any) => nT;

export type MappedObject<O, T> = { [key in keyof O]-?: T };

export type MappedObjectKeys<O> = Extract<keyof O, any>;
export type MappedObjectValues<O> = O[MappedObjectKeys<O>];

export function map<O, nT> (source: O, mapper: MapperType<MappedObjectValues<O>, nT>): MappedObject<O, nT> {
  const output = {};
  for (const key in source) {
    if (!hasOwnProperty(source, key)) continue;
    Object.assign(output, { [key]: mapper(source[key], key) });
  }
  return output as MappedObject<O, nT>;
}

export type NonNullableField<O> = { [key in keyof O]-?: NonNullable<O[key]> };
export type NonNullableFieldDeep<O> = { [key in keyof O]-?: NonNullableFieldDeep<NonNullable<O[key]>> };

export type ConstructorOf<T> = new (...args: readonly any[]) => T;

export function isCalledFromChild<parentT extends object, childT extends parentT> (obj: childT, parent: ConstructorOf<parentT>): boolean {
  return obj instanceof parent && obj.constructor !== parent;
}

export function isCalledFromParent<parentT extends object, childT extends parentT> (obj: childT, parent: ConstructorOf<parentT>): boolean {
  return obj instanceof parent && obj.constructor === parent;
}

export interface IPrototype {
  prototype: any;
}

export function ApplyMixinDecorator<baseT extends IPrototype, T extends baseT> (mixin: T) {
  return function (constructor: baseT) {
    for (const propertyName of Object.getOwnPropertyNames(mixin.prototype)) {
      constructor.prototype[propertyName] = mixin.prototype[propertyName];
    }
  };
}
