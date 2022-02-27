import { CommanderoManager } from '../src/CommanderoManager';

export function manager<ctxT extends {}> (obj: any = {}): CommanderoManager<ctxT> {
  return obj;
}
