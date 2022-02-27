import { CommandsManager } from '../src/CommandsManager';

export function manager<ctxT extends {}> (obj: any = {}): CommandsManager<ctxT> {
  return obj;
}
