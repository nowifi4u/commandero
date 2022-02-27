import { BaseThrottle } from './BaseThrottle';

export interface TimeoutData {
  timeout: ReturnType<typeof setTimeout>;
  expireTime: number;
}

export abstract class BaseIDThrottle<ctxT extends {}> extends BaseThrottle<ctxT> {
  public readonly cache: Map<string, TimeoutData> = new Map();

  public start (message: string, context: ctxT, timeout: number = this.calculateTimeout(message, context)): number | undefined {
    return this.startID(this.calculateID(context), timeout);
  }

  public startID (id: string, timeout: number): number | undefined {
    const old = this.checkID(id);
    if (old != null) return old;

    this._startID(id, timeout);
    return undefined;
  }

  protected _startID (id: string, timeout: number): void {
    this.cache.set(id, {
      expireTime: Date.now() + timeout,
      timeout: setTimeout(() => this.stopID(id), timeout),
    });
  }

  public stop (message: string, context: ctxT): number | undefined {
    return this.stopID(this.calculateID(context));
  }

  public stopID (id: string): number | undefined {
    const old = this.checkID(id);
    if (old == null) return undefined;

    this._stopID(id);
    return old;
  }

  protected _stopID (id: string): void {
    const old = this.cache.get(id);
    if (old == null) return;

    clearTimeout(old.timeout);
    this.cache.delete(id);
  }

  public refresh (message: string, context: ctxT, timeout: number = this.calculateTimeout(message, context)): number | undefined {
    return this.refreshID(this.calculateID(context), timeout);
  }

  public refreshID (id: string, timeout: number): number | undefined {
    const old = this.checkID(id);
    if (old != null) this._stopID(id);
    this._startID(id, timeout);
    return old;
  }

  public check (message: string, context: ctxT): number | undefined {
    return this.checkID(this.calculateID(context));
  }

  public checkID (id: string): number | undefined {
    const t = this.cache.get(id);
    if (t == null) return undefined;
    return t.expireTime - Date.now();
  }

  public abstract calculateID (context: ctxT): string;
}
