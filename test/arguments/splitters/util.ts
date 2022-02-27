import { ArgumentExtractor } from '../../../src/arguments/extractors/base';

export function extractAllArguments (args: string, extractor: ArgumentExtractor): string[] {
  const it = args[Symbol.iterator]();
  const results: string[] = [];
  let current = extractor(it);
  while (!current.done) {
    results.push(current.value);
    current = extractor(it);
  }
  return results;
}

export function makeExtractAllArguments (extractor: ArgumentExtractor): (args: string) => string[] {
  return function (args: string): string[] {
    return extractAllArguments(args, extractor);
  };
}
