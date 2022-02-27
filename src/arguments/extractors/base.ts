export type ArgumentExtractor = (it: IterableIterator<string>) => IteratorResult<string, undefined>;

export function skipLeadingWhitespace (it: IterableIterator<string>, current: IteratorResult<string, any> = it.next()): IteratorResult<string, any> {
  while (!current.done && current.value.match(/\s/)) {
    current = it.next();
  }
  return current;
}
