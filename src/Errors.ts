export class UserError extends Error {
  public readonly args: Record<string, string> = {}

  public constructor (localeMessage: string) {
    super(localeMessage);
    this.name = 'UserError';
  }
}

export class IncorrectTypeUserError extends UserError {
  public constructor () {
    super('');
  }
}
