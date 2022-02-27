import { skipLeadingWhitespace } from './base';

export function basicExtractor (it: IterableIterator<string>): IteratorResult<string, undefined> {
  let current = skipLeadingWhitespace(it);

  if (current.done) {
    return {
      done: true,
      value: undefined,
    };
  }

  let result = '';
  while (!current.done) {
    const cval = current.value;
    if (cval.match(/^\s$/)) {
      return {
        value: result,
        done: false,
      };
    }
    result += cval;
    current = it.next();
  }

  return {
    value: result,
    done: false,
  };
}
