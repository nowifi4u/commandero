export function splitArgs (input: string, { sep, keepQuotes }: { sep?: string | RegExp, keepQuotes?: boolean } = {}): string[] {
  const separator = sep ?? /\s+/g;
  let singleQuoteOpen = false;
  let doubleQuoteOpen = false;
  let tokenBuffer = [];
  const ret = [];

  const arr = input.split('');
  for (let i = 0; i < arr.length; ++i) {
    const element = arr[i];
    const matches = element.match(separator);
    if (element === "'" && !doubleQuoteOpen) {
      if (keepQuotes) {
        tokenBuffer.push(element);
      }
      singleQuoteOpen = !singleQuoteOpen;
      continue;
    } else if (element === '"' && !singleQuoteOpen) {
      if (keepQuotes) {
        tokenBuffer.push(element);
      }
      doubleQuoteOpen = !doubleQuoteOpen;
      continue;
    }

    if (!singleQuoteOpen && !doubleQuoteOpen && matches) {
      if (tokenBuffer.length > 0) {
        ret.push(tokenBuffer.join(''));
        tokenBuffer = [];
      } else if (sep != null) {
        ret.push(element);
      }
    } else {
      tokenBuffer.push(element);
    }
  }
  if (tokenBuffer.length > 0) {
    ret.push(tokenBuffer.join(''));
  } else if (sep != null) {
    ret.push('');
  }
  return ret;
}
