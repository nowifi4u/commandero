import { UserError } from '../../Errors';
import { ArgumentExtractor, skipLeadingWhitespace } from './base';

export interface QuoteEscapeArgumentExtractorOptions {
  disableSingleQuote?: boolean;
  disableDoubleQuote?: boolean;
  disableEscape?: boolean;
}

interface State {
  singleQuoted?: boolean;
  doubleQuoted?: boolean;
  wasQuoted?: boolean;
  escaped?: boolean;
  result: string;
}

type ProcFunc = (c: string, state: State, options: QuoteEscapeArgumentExtractorOptions) => void;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
function procSpace (c: string, state: State, options: QuoteEscapeArgumentExtractorOptions): string | void {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (state.escaped || state.singleQuoted || state.doubleQuoted) {
    return procOther(c, state, options);
  }

  return state.result;
}

function procEscape (c: string, state: State, options: QuoteEscapeArgumentExtractorOptions): void {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (state.escaped || options.disableEscape) {
    return procOther(c, state, options);
  }

  state.escaped = true;
}

function procSingleQuote (c: string, state: State, options: QuoteEscapeArgumentExtractorOptions): void {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (state.escaped || state.doubleQuoted || options.disableSingleQuote) {
    return procOther(c, state, options);
  }
  if (state.singleQuoted) {
    state.singleQuoted = false;
    state.wasQuoted = true;
    return;
  }

  if (state.result.length > 0) throw new TextBeforeQuoteUserError(state);
  if (state.wasQuoted) throw new TextAfterQuoteUserError(state);
  state.singleQuoted = true;
}

function procDoubleQuote (c: string, state: State, options: QuoteEscapeArgumentExtractorOptions): void {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (state.escaped || options.disableDoubleQuote || state.singleQuoted) {
    return procOther(c, state, options);
  }
  if (state.doubleQuoted) {
    state.doubleQuoted = false;
    state.wasQuoted = true;
    return;
  }

  if (state.result.length > 0) throw new TextBeforeQuoteUserError(state);
  if (state.wasQuoted) throw new TextAfterQuoteUserError(state);
  state.doubleQuoted = true;
}

function procOther (c: string, state: State, _options: QuoteEscapeArgumentExtractorOptions): void {
  if (state.wasQuoted) throw new TextAfterQuoteUserError(state);
  state.escaped = false;
  state.result += c;
}

const PROC_MAP = new Map<RegExp | string, ProcFunc>([
  [/\\/, procEscape],
  [/'/, procSingleQuote],
  [/"/, procDoubleQuote],
]);

function quoteEscapeExtractor (it: IterableIterator<string>, options: QuoteEscapeArgumentExtractorOptions = {}): IteratorResult<string, undefined> {
  let current = skipLeadingWhitespace(it);
  if (current.done) {
    return {
      done: true,
      value: undefined,
    };
  }
  const state: State = {
    result: '',
  };
  // eslint-disable-next-line no-labels
  mainloop:
  while (!current.done) {
    const cval = current.value;
    if (cval.match(/\s/)) {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (state.singleQuoted || state.doubleQuoted || state.escaped) {
        procSpace(cval, state, options);
        current = it.next();
        continue;
      } else {
        return {
          value: state.result,
          done: false,
        };
      }
    }

    for (const [procRegex, procFunc] of PROC_MAP) {
      if (cval.match(procRegex)) {
        procFunc(cval, state, options);
        // console.log(procFunc.name, `"${cval}"`, JSON.stringify(state));
        current = it.next();
        // eslint-disable-next-line no-labels
        continue mainloop;
      }
    }

    // console.log(procOther.name, `"${cval}"`, JSON.stringify(state));
    procOther(cval, state, options);
    current = it.next();
    continue;
  }

  UnmatchedSingleQuoteUserError.validate(state);
  UnmatchedDoubleQuoteUserError.validate(state);
  UnmatchedEscapeUserError.validate(state);

  // console.log();
  return {
    value: state.result,
    done: false,
  };
}

export function makeQuoteEscapeExtractor (options: QuoteEscapeArgumentExtractorOptions = {}): ArgumentExtractor {
  return function _quoteEscapeExtractor (it: IterableIterator<string>): IteratorResult<string, undefined> {
    return quoteEscapeExtractor(it, options);
  };
}

export class ArgumentSplitUserError extends UserError {
  public readonly state: State;

  public constructor (localeMessage: string, state: State) {
    super(localeMessage);
    this.state = state;
  }
}

export class TextBeforeQuoteUserError extends ArgumentSplitUserError {
  public constructor (state: State) {
    super('[[ error.TextBeforeQuote.message ]]', state);
  }
}

export class TextAfterQuoteUserError extends ArgumentSplitUserError {
  public constructor (state: State) {
    super('[[ error.TextAfterQuote.message ]]', state);
  }
}

export class UnmatchedSingleQuoteUserError extends ArgumentSplitUserError {
  public constructor (state: State) {
    super('[[ error.UnmatchedSingleQuote.message ]]', state);
  }

  public static validate (state: State): void {
    if (state.singleQuoted) throw new UnmatchedSingleQuoteUserError(state);
  }
}

export class UnmatchedDoubleQuoteUserError extends ArgumentSplitUserError {
  public constructor (state: State) {
    super('[[ error.UnmatchedDoubleQuote.message ]]', state);
  }

  public static validate (state: State): void {
    if (state.doubleQuoted) throw new UnmatchedDoubleQuoteUserError(state);
  }
}

export class UnmatchedEscapeUserError extends ArgumentSplitUserError {
  public constructor (state: State) {
    super('[[ error.UnmatchedEscape.message ]]', state);
  }

  public static validate (state: State): void {
    if (state.escaped) throw new UnmatchedEscapeUserError(state);
  }
}
