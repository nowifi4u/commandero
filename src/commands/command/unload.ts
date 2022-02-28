import { CommanderoManager } from '../../CommanderoManager';
import { BaseTypeExtractReturnTs } from '../../types/base/Base';
import { CommandType } from '../../types/Command';
import { BaseCommand, BaseCommandOptions } from '../base/BaseCommand';

export type CommandUnloadCommandOptions<ctxT extends {}> = Omit<BaseCommandOptions<ctxT, []>, 'arguments'>;

export type CommandUnloadCommandArgTs<ctxT extends {}> = [
  CommandType<ctxT, never, false>,
];

export class CommandUnloadCommand<ctxT extends {}> extends BaseCommand<ctxT, CommandUnloadCommandArgTs<ctxT>> {
  public constructor (manager: CommanderoManager<ctxT>, options: CommandUnloadCommandOptions<ctxT>) {
    super(manager, {
      isGuarded: true,
      isHidden: true,
      ...options,
      arguments: [
        new CommandType<ctxT, never, false>(manager, {}),
      ],
    });
  }

  public async run ([arg1]: BaseTypeExtractReturnTs<ctxT, CommandUnloadCommandArgTs<ctxT>>, rawArgs: [], context: ctxT): Promise<void> {
    if (arg1 instanceof BaseCommand) {
      this.manager.commands.unregister(arg1);
      await arg1.destroy();
    }
  }
}
