import { CommandsManager } from '../../CommandsManager';
import { BaseTypeExtractReturnTs } from '../../types/base/Base';
import { CommandType } from '../../types/Command';
import { CommandGroupType } from '../../types/CommandGroup';
import { UnionType } from '../../types/join/Union';
import { BaseCommand, BaseCommandOptions } from '../base/BaseCommand';
import { CommandGroup } from '../base/CommandGroup';

export type CommandDisableCommandOptions<ctxT extends {}> = Omit<BaseCommandOptions<ctxT, []>, 'arguments'>;

export type CommandDisableCommandArgTs<ctxT extends {}> = [
  UnionType<ctxT, [CommandType<ctxT, never, false>, CommandGroupType<ctxT, never, false>], never>,
];

export class CommandDisableCommand<ctxT extends {}> extends BaseCommand<ctxT, CommandDisableCommandArgTs<ctxT>> {
  public constructor (manager: CommandsManager<ctxT>, options: CommandDisableCommandOptions<ctxT>) {
    super(manager, {
      isGuarded: true,
      isHidden: true,
      ...options,
      arguments: [
        new UnionType(manager, {
          types: [
            new CommandType<ctxT, never, false>(manager, {}),
            new CommandGroupType<ctxT, never, false>(manager, {}),
          ],
        }),
      ],
    });
  }

  public async run ([arg1]: BaseTypeExtractReturnTs<ctxT, CommandDisableCommandArgTs<ctxT>>, rawArgs: [], context: ctxT): Promise<void> {
    if (arg1 instanceof BaseCommand) {
      arg1.isEnabled = true;
    } else if (arg1 instanceof CommandGroup) {
      arg1.isEnabled = true;
    }
  }
}
