import { IsInstance } from 'class-validator';
import { CommandGroup, CommandGroupOptions } from './commands/base/CommandGroup';
import { CommanderoManager } from './CommanderoManager';

export type CommandGroupRegisterable<ctxT extends {}> = CommandGroupOptions<ctxT> | CommandGroup<ctxT>;
export type CommandGroupResolvable<ctxT extends {}> = string | CommandGroupOptions<ctxT> | CommandGroup<ctxT>;

export interface CommandGroupResolveOptions {
  checkGroupID?: boolean;
  checkGroupRef?: boolean;
  returnCached?: boolean;
}

export class CommandGroupManager<ctxT extends {}> {
  @IsInstance(CommanderoManager)
  public readonly manager: CommanderoManager<ctxT>;

  public readonly cache: Map<string, CommandGroup<ctxT>> = new Map();

  public constructor (manager: CommanderoManager<ctxT>) {
    this.manager = manager;
  }

  public register (group: CommandGroupRegisterable<ctxT>): CommandGroup<ctxT> {
    let resolvedGroup: CommandGroup<ctxT>;
    if (group instanceof CommandGroup) {
      resolvedGroup = group;
    } else if (typeof group === 'object') {
      resolvedGroup = new CommandGroup(this.manager, group);
    } else {
      throw new TypeError('Invalid command group type');
    }

    {
      const existingGroup = this.resolveID(resolvedGroup, { checkGroupID: true });
      if (existingGroup != null) {
        throw new Error(`A command group with id "${existingGroup}" is already registered.`);
      }
    }

    this.cache.set(resolvedGroup.id, resolvedGroup);
    return resolvedGroup;
  }

  public unregister (group: CommandGroupResolvable<ctxT>): CommandGroup<ctxT> | undefined {
    const existingGroup = this.resolve(group, { checkGroupID: true, checkGroupRef: true });
    if (!existingGroup) return undefined;

    this.cache.delete(existingGroup.id.toLowerCase());

    return existingGroup;
  }

  public resolve (group: CommandGroupResolvable<ctxT>, options: CommandGroupResolveOptions = {}): CommandGroup<ctxT> | undefined {
    if (typeof group === 'string') {
      return this.cache.get(group);
    }
    if (group instanceof CommandGroup) {
      if (!options.checkGroupID) return group;
      if (options.checkGroupID) {
        const existingGroup = this.cache.get(group.id.toLowerCase());
        if (existingGroup != null) {
          if (options.checkGroupRef) return existingGroup === group ? existingGroup : undefined;
          return options.returnCached ? existingGroup : group;
        }
      }
      return undefined;
    }
    if (typeof group === 'object') {
      return this.cache.get(group.id);
    }
    throw new TypeError('Invalid command group type');
  }

  public resolveID (group: CommandGroupResolvable<ctxT>, options: CommandGroupResolveOptions = {}): string | undefined {
    return this.resolve(group, options)?.id;
  }

  public has (group: CommandGroupResolvable<ctxT>, options: CommandGroupResolveOptions = {}): boolean {
    return this.resolve(group, options) != null;
  }
}
