export type RegExpResolvable = RegExp | string;

export function resolveRegExpSource (source: RegExpResolvable): string {
  if (typeof source === 'string') return source;
  if (source instanceof RegExp) return source.source;
  throw new TypeError('Invalid RegExp resolvable type');
}

export function makeGlobal (source: RegExpResolvable): RegExp {
  source = resolveRegExpSource(source);
  return new RegExp(source, 'gi');
}

export function makeSingle (source: RegExpResolvable): RegExp {
  source = resolveRegExpSource(source);
  return new RegExp(`^${source}$`, 'i');
}

export type RegExpFactory = () => RegExp;

export function makeFactoryGlobal (source: RegExpResolvable): RegExpFactory {
  const regex = makeGlobal(source);
  return () => new RegExp(regex);
}

export function makeFactorySingle (source: RegExpResolvable): RegExpFactory {
  const regex = makeSingle(source);
  return () => new RegExp(regex);
}
