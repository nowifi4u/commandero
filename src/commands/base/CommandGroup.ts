import { IsBoolean, IsInstance, IsLowercase, IsOptional, IsString } from 'class-validator';
import { CommandResolvable, CommandResolveOptions } from '../../CommandManager';
import { CommanderoManager } from '../../CommanderoManager';
import { Inhibitor } from '../../Inhibitor';
import { BaseCommand, UnknownBaseCommand } from './BaseCommand';

export interface CommandGroupHelpOptions {
  description?: string;
}

export interface CommandGroupResolveOptions {
  checkCommandID?: boolean;
  checkCommandAliases?: boolean;
  checkCommandRef?: boolean;
  returnCached?: boolean;
}

export interface CommandGroupOptions<ctxT extends {}> {
  id: string;
  help?: CommandGroupHelpOptions;

  inhibitors?: Array<Inhibitor<ctxT>>;

  isEnabled: boolean;
  isGuarded?: boolean;
  isHidden?: boolean;
}

export class CommandGroup<ctxT extends {}> {
  @IsInstance(CommanderoManager)
  public readonly manager: CommanderoManager<ctxT>;

  public readonly cache: Map<string, UnknownBaseCommand<ctxT>> = new Map();

  @IsString()
  @IsLowercase()
  public readonly id: string;

  @IsBoolean()
  public isEnabled: boolean;

  @IsOptional()
  @IsBoolean()
  public isGuarded?: boolean;

  @IsOptional()
  @IsBoolean()
  public isHidden?: boolean;

  public constructor (manager: CommanderoManager<ctxT>, options: CommandGroupOptions<ctxT>) {
    this.manager = manager;
    this.id = options.id;

    this.isEnabled = options.isEnabled ?? true;
    this.isGuarded = options.isGuarded;
    this.isHidden = options.isHidden;
  }

  public register (command: UnknownBaseCommand<ctxT>): UnknownBaseCommand<ctxT> {
    {
      const existingCommand = this.resolveID(command, { checkCommandID: true, checkCommandAliases: true });
      if (existingCommand != null) throw new Error(`A command with the name/alias "${existingCommand}" is already registered.`);
    }

    this.cache.set(command.id.toLowerCase(), command);
    for (const [alias] of command.aliases ?? []) {
      this.cache.set(alias.toLowerCase(), command);
    }

    return command;
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
