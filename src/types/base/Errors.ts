import { UserError } from '../../Errors';

// -------------------- CRITICAL ERRORS -------------------- //

export class NoDefaultError extends Error {
  public constructor () {
    super();
  }
}

export class MultipleErrorsError extends UserError {
  public readonly errors: unknown[];

  public constructor (errors: unknown[]) {
    super(['Multiple errors occured:', ...errors.map(error => String(error))].join('\n'));
    this.name = 'MultipleErrorsError';
    this.errors = errors;
  }
}

// -------------------- USER ERRORS -------------------- //

export function isUserError (err: unknown): err is UserError | null {
  return err == null || err instanceof UserError;
}

export type ToStringConverter<T> = (value: T) => string;
export function toStringConverter<T> (value: T): string {
  return String(value);
}

export interface IStringifier<T> {
  stringifier?: ToStringConverter<T>;
}

export interface IMaxValues {
  maxValues?: number;
}

export interface IPrint {
  print?: boolean;
}

export class OneOfUserError<T> extends UserError {
  public static maxValues: number = 15;

  public constructor (values: T[], { stringifier = toStringConverter, maxValues = OneOfUserError.maxValues, print = true }: IStringifier<T> & IMaxValues & IPrint = {}) {
    super('[[ errors.OneOf.message ]]');

    let valsJoined: string;
    if (values.length > maxValues) {
      valsJoined = '[[ errors.OneOf.maxValues ]]';
    } else if (!print) {
      valsJoined = '[[ errors.OneOf.noPrint ]]';
    } else {
      const strvalues = values.map(stringifier);
      valsJoined = strvalues.join(', ');
    }

    this.args.values = valsJoined;
    this.args.size = String(values.length);
  }

  public static validate<T> (value: T, oneOf?: T[], { stringifier = toStringConverter, maxValues = OneOfUserError.maxValues, print = true }: IStringifier<T> & IMaxValues & IPrint = {}): void {
    if (oneOf != null && !oneOf.includes(value)) throw new OneOfUserError(oneOf, { stringifier, maxValues, print });
  }
}

export class MultipleFoundUserError<T> extends UserError {
  public static maxValues: number = 15;

  public constructor (size: number, values: Iterable<T>, { stringifier = toStringConverter, maxValues = OneOfUserError.maxValues, print = true }: IStringifier<T> & IMaxValues & IPrint = {}) {
    super('[[ errors.MultipleFound.message ]]');

    let valsJoined: string;
    if (size > maxValues) {
      valsJoined = '[[ errors.MultipleFound.maxValues ]]';
    } else if (!print) {
      valsJoined = '[[ errors.MultipleFound.noPrint ]]';
    } else {
      const vals = Array.from(values);
      const strvalues = vals.map(stringifier);
      valsJoined = strvalues.join(', ');
    }

    this.args.values = valsJoined;
    this.args.size = String(size);
  }
}

export class NotInDMUserError extends UserError {
  public constructor () {
    super('[[ errors.NotInDM.message ]]');
  }
}

export class NotInGuildUserError extends UserError {
  public constructor () {
    super('[[ errors.NotInGuild.message ]]');
  }
}

export class MinNumberUserError<baseT, T extends baseT> extends UserError {
  public constructor (value: T, minValue: baseT, { stringifier = toStringConverter }: IStringifier<baseT> = {}) {
    super('[[ error.MinValue.message ]]');

    this.args.value = stringifier(value);
    this.args.minValue = stringifier(minValue);
  }

  public static validate<baseT, T extends baseT> (value: T, minValue?: baseT, { stringifier = toStringConverter }: IStringifier<baseT> = {}): void {
    if (minValue != null && value < minValue) throw new MinNumberUserError(value, minValue, { stringifier });
  }
}

export class MaxNumberUserError<baseT, T extends baseT> extends UserError {
  public constructor (value: T, maxValue: baseT, { stringifier = toStringConverter }: IStringifier<baseT> = {}) {
    super('[[ error.MaxValue.message ]]');

    this.args.value = stringifier(value);
    this.args.maxValue = stringifier(maxValue);
  }

  public static validate<baseT, T extends baseT> (value: T, maxValue?: baseT, { stringifier = toStringConverter }: IStringifier<baseT> = {}): void {
    if (maxValue != null && value > maxValue) throw new MaxNumberUserError(value, maxValue, { stringifier });
  }
}

export interface ILength {
  length: number;
}

export class MinLengthUserError<T extends ILength> extends UserError {
  public constructor (value: T, minValue: number, { stringifier = toStringConverter }: IStringifier<T> = {}) {
    super('[[ error.MinLength.message ]]');

    this.args.value = stringifier(value);
    this.args.minValue = String(minValue);
  }

  public static validate<T extends ILength> (value: T, minValue?: number, { stringifier = toStringConverter }: IStringifier<T> = {}): void {
    if (minValue != null && value.length < minValue) throw new MinLengthUserError(value, minValue, { stringifier });
  }
}

export class MaxLengthUserError<T extends ILength> extends UserError {
  public constructor (value: T, maxValue: number, { stringifier = toStringConverter }: IStringifier<T> = {}) {
    super('[[ error.MaxLength.message ]]');

    this.args.value = stringifier(value);
    this.args.maxValue = String(maxValue);
  }

  public static validate<T extends ILength> (value: T, maxValue?: number, { stringifier = toStringConverter }: IStringifier<T> = {}): void {
    if (maxValue != null && value.length > maxValue) throw new MaxLengthUserError(value, maxValue, { stringifier });
  }
}

export interface ArgumentsSizeOptions {
  min: number;
  max?: number;
}

export class ArgumentsSizeUserError extends UserError {
  public constructor (size: number, options: ArgumentsSizeOptions) {
    if (options.max == null) {
      super('[[ error.NotEnoughArguments.messages.min ]]');
      this.args.min = String(options.min);
    } else if (options.min === options.max) {
      super('[[ error.NotEnoughArguments.messages.equals ]]');
    } else {
      super('[[ error.NotEnoughArguments.messages.between ]]');
      this.args.min = String(options.min);
      this.args.max = String(options.max);
    }

    this.args.size = String(size);
  }
}

export class MultipleErrorsUserError extends UserError {
  public readonly errors: unknown[];

  public constructor (errors: unknown[]) {
    super('[[ error.MultipleErrors.error ]]');
    this.errors = errors;
  }
}
