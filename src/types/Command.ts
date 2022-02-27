/* eslint-disable @typescript-eslint/no-throw-literal */
import { UnknownBaseCommand } from '../commands/base/BaseCommand';
import { CommandsManager } from '../CommandsManager';
import { BaseType, BaseTypeOptions } from './base/Base';

export interface CommandTypeOptions<defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {

}

export class CommandType<ctxT extends {}, defT = never, infT extends boolean = false> extends BaseType<ctxT, UnknownBaseCommand<ctxT>, defT, infT> {
  declare public readonly options: CommandTypeOptions<defT, infT>;

  public constructor (manager: CommandsManager<ctxT>, options: CommandTypeOptions<defT, infT>) {
    super(manager, options, {
      typename: '[[ type.Command.typename ]]',
    });
  }

  public run (val: string): UnknownBaseCommand<ctxT> {
    const id = val.toString();
    const command = this.manager.commands.resolve(id);
    if (command == null) throw null;
    return command;
  }
}
