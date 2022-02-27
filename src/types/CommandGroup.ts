/* eslint-disable @typescript-eslint/no-throw-literal */
import { CommandGroup } from '../commands/base/CommandGroup';
import { CommanderoManager } from '../CommanderoManager';
import { BaseType, BaseTypeOptions } from './base/Base';

export interface CommandGroupTypeOptions<defT = never, infT extends boolean = false> extends BaseTypeOptions<defT, infT> {

}

export class CommandGroupType<ctxT extends {}, defT = never, infT extends boolean = false> extends BaseType<ctxT, CommandGroup<ctxT>, defT, infT> {
  declare public readonly options: CommandGroupTypeOptions<defT, infT>;

  public constructor (manager: CommanderoManager<ctxT>, options: CommandGroupTypeOptions<defT, infT>) {
    super(manager, options, {
      typename: '[[ type.Command.typename ]]',
    });
  }

  public run (val: string): CommandGroup<ctxT> {
    const id = val.toString();
    const group = this.manager.groups.resolve(id);
    if (group == null) throw null;
    return group;
  }
}
