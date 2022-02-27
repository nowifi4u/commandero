import { CommanderoManager } from '../CommanderoManager';
import { UserError } from '../Errors';

export abstract class BaseThrottle<ctxT extends {}> {
  public abstract start (message: string, context: ctxT, timeout?: number): number | undefined;
  public abstract stop (message: string, context: ctxT): number | undefined;
  public abstract refresh (message: string, context: ctxT, timeout?: number): number | undefined;
  public abstract check (message: string, context: ctxT): number | undefined;
  public abstract checkThrow (message: string, context: ctxT): UserError | null | Promise<UserError | null>;
  public abstract calculateTimeout (message: string, context: ctxT): number;

  public static async checkThrottle<ctxT extends {}> (throttle: BaseThrottle<ctxT>, message: string, context: ctxT): Promise<void> {
    const err = await throttle.checkThrow(message, context);
    if (err != null) throw err;
  }

  public static async checkThrottles<ctxT extends {}> (throttles: Array<BaseThrottle<ctxT>>, message: string, context: ctxT): Promise<void> {
    for (const throttle of throttles) {
      await BaseThrottle.checkThrottle(throttle, message, context);
    }
  }
}

export type ThrottleConstructor<ctxT extends {}, T extends BaseThrottle<ctxT>> = new () => T;
export interface ThrottleConstructorDefault<ctxT extends {}, T extends BaseThrottle<ctxT>> {
  default: ThrottleConstructor<ctxT, T>;
}
export type ThrottleConstructable<ctxT extends {}, T extends BaseThrottle<ctxT> = BaseThrottle<ctxT>> = T | ThrottleConstructor<ctxT, T> | ThrottleConstructorDefault<ctxT, T>;

export class ThrottleManager<ctxT extends {}> {
  public readonly manager: CommanderoManager<ctxT>;
  public readonly cache: Set<BaseThrottle<ctxT>> = new Set();

  public constructor (manager: CommanderoManager<ctxT>) {
    this.manager = manager;
  }

  public register (...throttles: Array<BaseThrottle<ctxT>>): void {
    for (const throttle of throttles) {
      this.cache.add(throttle);
    }
  }

  public unregister (...throttles: Array<BaseThrottle<ctxT>>): void {
    for (const throttle of throttles) {
      this.cache.delete(throttle);
    }
  }

  public async check (message: string, context: ctxT): Promise<UserError | null> {
    try {
      await Promise.all([...this.cache].map(async throttle => await throttle.checkThrow(message, context)));
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
