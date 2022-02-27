import { IsInstance } from 'class-validator';
import { BaseCommand, UnknownBaseCommand } from './commands/base/BaseCommand';
import { CommandsManager } from './CommandsManager';
import { isConstructor } from './util/Util';

export type CommandConstructor<ctxT extends {}> = new (manager: CommandsManager<ctxT>) => UnknownBaseCommand<ctxT>;
export interface CommandConstructorDefault<ctxT extends {}> {
  default: CommandConstructor<ctxT>;
}

export type CommandRegisterable<ctxT extends {}> = UnknownBaseCommand<ctxT> | CommandConstructor<ctxT> | CommandConstructorDefault<ctxT>;
export type CommandResolvable<ctxT extends {}> = string | UnknownBaseCommand<ctxT>;

export interface CommandResolveOptions {
  checkCommandID?: boolean;
  checkCommandAliases?: boolean;
  checkCommandRef?: boolean;
  returnCached?: boolean;
}

export class CommandManager<ctxT extends {}> {
  @IsInstance(CommandsManager)
  public readonly manager: CommandsManager<ctxT>;

  public readonly cache: Map<string, UnknownBaseCommand<ctxT>> = new Map();

  public constructor (manager: CommandsManager<ctxT>) {
    this.manager = manager;
  }

  public register (command: CommandRegisterable<ctxT>): UnknownBaseCommand<ctxT> {
    let resolvedCommand: UnknownBaseCommand<ctxT>;
    if (command instanceof BaseCommand) {
      resolvedCommand = command;
    } else if (isConstructor(command, BaseCommand)) {
      // @ts-expect-error
      // eslint-disable-next-line new-cap
      resolvedCommand = new command(this.client);
    } else if ('default' in command && isConstructor(command.default, BaseCommand)) {
      // @ts-expect-error
      // eslint-disable-next-line new-cap
      resolvedCommand = new command.default(this.client);
    } else {
      throw new Error('Invalid command type');
    }

    {
      const existingCommand = this.resolveID(resolvedCommand, { checkCommandID: true, checkCommandAliases: true });
      if (existingCommand != null) throw new Error(`A command with the name/alias "${existingCommand}" is already registered.`);
    }

    this.cache.set(resolvedCommand.id.toLowerCase(), resolvedCommand);
    for (const [alias] of resolvedCommand.aliases ?? []) {
      this.cache.set(alias.toLowerCase(), resolvedCommand);
    }

    return resolvedCommand;
  }

  public unregister (command: CommandResolvable<ctxT>): UnknownBaseCommand<ctxT> | undefined {
    const existingCommand = this.resolve(command, { checkCommandID: true, checkCommandRef: true });
    if (!existingCommand) return undefined;

    this.cache.delete(existingCommand.id.toLowerCase());
    for (const [alias] of existingCommand.aliases ?? []) {
      this.cache.delete(alias.toLowerCase());
    }

    return existingCommand;
  }

  public resolve (command: CommandResolvable<ctxT>, options: CommandResolveOptions = {}): UnknownBaseCommand<ctxT> | undefined {
    if (typeof command === 'string') {
      return this.cache.get(command.toLowerCase());
    } else if (command instanceof BaseCommand) {
      if (!options.checkCommandID && !options.checkCommandAliases) return command;
      if (options.checkCommandID) {
        const existingCommand = this.cache.get(command.id.toLowerCase());
        if (existingCommand != null) {
          if (options.checkCommandRef) return existingCommand === command ? existingCommand : undefined;
          return options.returnCached ? existingCommand : command;
        }
      }
      if (options.checkCommandAliases) {
        for (const [alias] of command.aliases ?? []) {
          const existingCommand = this.cache.get(alias.toLowerCase());
          if (existingCommand != null) {
            if (options.checkCommandRef) return existingCommand === command ? existingCommand : undefined;
            return options.returnCached ? existingCommand : command;
          }
        }
      }
      return undefined;
    } else {
      throw new TypeError('Invalid command type');
    }
  }

  public resolveID (command: CommandResolvable<ctxT>, options: CommandResolveOptions = {}): string | undefined {
    return this.resolve(command, options)?.id;
  }

  public has (command: CommandResolvable<ctxT>, options: CommandResolveOptions = {}): boolean {
    return this.resolve(command, options) != null;
  }
}
