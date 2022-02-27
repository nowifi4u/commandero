import { CommanderoManager } from '../../CommanderoManager';
import { BaseTypeExtractReturnTs } from '../../types/base/Base';
import { CommandType } from '../../types/Command';
import { BaseCommand, BaseCommandOptions } from '../base/BaseCommand';

export type CommandDisableCommandOptions<ctxT extends {}> = Omit<BaseCommandOptions<ctxT, []>, 'arguments'>;

export type CommandDisableCommandArgTs<ctxT extends {}> = [
  CommandType<ctxT, never, false>,
];

export class CommandDisableCommand<ctxT extends {}> extends BaseCommand<ctxT, CommandDisableCommandArgTs<ctxT>> {
  public constructor (manager: CommanderoManager<ctxT>, options: CommandDisableCommandOptions<ctxT>) {
    super(manager, {
      isGuarded: true,
      isHidden: true,
      ...options,
      arguments: [
        new CommandType<ctxT, never, false>(manager, {}),
      ],
    });
  }

  public async run ([arg1]: BaseTypeExtractReturnTs<ctxT, CommandDisableCommandArgTs<ctxT>>, rawArgs: [], context: ctxT): Promise<void> {
    if (arg1 instanceof BaseCommand) {
      this.manager.commands.unregister(arg1);
      await arg1.destroy();
    }
  }
}
