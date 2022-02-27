import { CommanderoManager } from './CommanderoManager';
import { UserError } from './Errors';

export type Inhibitor<ctxT extends {}> = (message: string, context: ctxT) => UserError | null | Promise<UserError | null>;

export class InhibitorManager<ctxT extends {}> {
  public readonly manager: CommanderoManager<ctxT>;
  public readonly cache: Set<Inhibitor<ctxT>> = new Set();

  public constructor (manager: CommanderoManager<ctxT>) {
    this.manager = manager;
  }

  public register (...inhibitors: Array<Inhibitor<ctxT>>): void {
    for (const inhibitor of inhibitors) {
      this.cache.add(inhibitor);
    }
  }

  public unregister (...inhibitors: Array<Inhibitor<ctxT>>): void {
    for (const inhibitor of inhibitors) {
      this.cache.delete(inhibitor);
    }
  }

  public async check (message: string, context: ctxT): Promise<UserError | null> {
    try {
      await Promise.all([...this.cache].map(async inhibitor => await new Promise((resolve, reject) => {
        Promise.resolve(inhibitor(message, context)).catch(reject);
      })));
      return null;
    } catch (err) {
      return err as UserError | null;
    }
  }

  public async checkThrow (message: string, context: ctxT): Promise<void> {
    const err = await this.check(message, context);
    if (err != null) throw err;
  }
}

// function checkInhinitor (value: any): void | never {
//   if (typeof value !== 'function') throw new TypeError('Inhibitor must be a function');
// }
