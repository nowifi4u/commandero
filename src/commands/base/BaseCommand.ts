import { IsArray, IsBoolean, IsInstance, IsLowercase, IsObject, IsOptional, IsString, validateSync } from 'class-validator';
import { Memoize } from 'typescript-memoize';
import { CommandsManager } from '../../CommandsManager';
import { Inhibitor, InhibitorManager } from '../../Inhibitor';
import { BaseThrottle, ThrottleManager } from '../../throttle/BaseThrottle';
import { BaseTypeExtractReturnTs, UnknownBaseType } from '../../types/base/Base';
import { ArgumentsSizeUserError, ArgumentsSizeOptions } from '../../types/base/Errors';
import { CommandGroup } from './CommandGroup';

export type AliasMultiplier = (alias: string) => string[];

export interface BaseCommandAliasOptions {
  aliases: string[];
}

export interface BaseCommandHelpOptions {
  description?: string;
  format?: string;
  examples?: string[];
}

export interface BaseCommandOptions<ctxT extends {}, argTs extends ReadonlyArray<UnknownBaseType<ctxT>> | []> {
  id: string;
  aliases?: string[];
  help?: BaseCommandHelpOptions;
  groupID?: string;

  arguments: argTs;
  inhibitors?: Array<Inhibitor<ctxT>>;
  throttles?: Array<BaseThrottle<ctxT>>;
  isEnabled?: boolean;
  isGuarded?: boolean;
  isHidden?: boolean;
  allowExtraArguments?: boolean;
}

export abstract class BaseCommand<ctxT extends {}, argTs extends ReadonlyArray<UnknownBaseType<ctxT>> | []> {
  @IsInstance(CommandsManager)
  public readonly manager: CommandsManager<ctxT>;

  @IsString()
  @IsLowercase()
  public readonly id: string;

  @IsString({ each: true })
  @IsLowercase({ each: true })
  public aliases: string[] = [];

  @IsOptional()
  @IsObject()
  public help?: BaseCommandHelpOptions;

  @IsOptional()
  @IsInstance(CommandGroup)
  public group?: CommandGroup<ctxT>;

  @IsArray()
  public readonly arguments: argTs;

  public throttles: ThrottleManager<ctxT>;
  public inhibitors: InhibitorManager<ctxT>;

  @IsBoolean()
  public isEnabled: boolean;

  @IsOptional()
  @IsBoolean()
  public isGuarded?: boolean;

  @IsOptional()
  @IsBoolean()
  public isHidden?: boolean;

  @IsOptional()
  @IsBoolean()
  public allowExtraArguments?: boolean;

  public readonly hasInfinite: boolean;
  public readonly hasDefault: boolean;

  public constructor (manager: CommandsManager<ctxT>, options: BaseCommandOptions<ctxT, argTs>) {
    this.manager = manager;

    this.id = options.id;
    if (options.aliases != null) this.aliases.push(...options.aliases);
    this.help = options.help;
    if (options.groupID != null) {
      const group = this.manager.groups.resolve(options.groupID);
      if (group != null) throw new Error();
    }

    this.arguments = options.arguments;
    this.inhibitors = new InhibitorManager(this.manager);
    if (options.inhibitors != null) this.inhibitors.register(...options.inhibitors);
    this.throttles = new ThrottleManager(this.manager);
    if (options.throttles != null) this.throttles.register(...options.throttles);
    this.isEnabled = options.isEnabled ?? true;
    this.isGuarded = options.isGuarded;
    this.isHidden = options.isHidden;
    this.allowExtraArguments = options.allowExtraArguments;

    this.hasInfinite = false;
    this.hasDefault = false;
    for (const argument of options.arguments) {
      if (this.hasInfinite) throw new Error();
      if ('default' in argument.options) {
        this.hasDefault = true;
      } else if (this.hasDefault) {
        throw new Error();
      }
      if (argument.options.infinite) {
        this.hasInfinite = true;
      }
    }

    validateSync(this);
  }

  public get groupID (): string | undefined {
    return this.group?.id;
  }

  @Memoize()
  public getExpectedArgumentsSize (): ArgumentsSizeOptions {
    const min = this.hasDefault ? this.arguments.findIndex(argument => 'infinite' in argument.options) : this.arguments.length;
    if (this.hasInfinite) {
      return { min };
    } else {
      return { min, max: this.arguments.length };
    }
  }

  public async handleMessage (message: string, context: ctxT): Promise<void> {
    await this.inhibitors.checkThrow(message, context);
    await this.throttles.checkThrow(message, context);

    const rawArgs = this.handleMessageRawArgs(message, context);
    const args = await this.handleMessageArgs(rawArgs, context);

    await this.run(args, rawArgs, context);
  }

  public handleMessageRawArgs (message: string, context: ctxT): string[] {
    const it = message[Symbol.iterator]();
    const rawArgs: string[] = [];
    for (const argument of this.arguments) {
      const argumentExtractor = argument.options.extractor ?? this.manager.defaultArgumentExtractor;
      const rawArg = argumentExtractor(it);
      if (rawArg.done) return rawArgs;
      rawArgs.push(rawArg.value);
    }
    return rawArgs;
  }

  public async handleMessageArgs (rawArgs: string[], context: ctxT): Promise<BaseTypeExtractReturnTs<ctxT, argTs>> {
    let done: boolean = false;
    const args = Promise.all(this.arguments.map(async (argType, iarg) => {
      done ||= iarg >= rawArgs.length;
      if (done) {
        if (!('default' in argType.options)) throw new ArgumentsSizeUserError(iarg, this.getExpectedArgumentsSize());
        return argType.options.default;
      }
      if (argType.options.infinite) {
        // eslint-disable-next-line @typescript-eslint/return-await
        return Promise.all(rawArgs.slice(iarg).map(rawArg => argType.run(rawArg, context)));
      }
      // eslint-disable-next-line @typescript-eslint/return-await
      return await argType.run(rawArgs[iarg], context);
    }));

    if (!done && !this.allowExtraArguments) throw new ArgumentsSizeUserError(rawArgs.length, this.getExpectedArgumentsSize());

    return args as any;
  }

  public abstract run (args: BaseTypeExtractReturnTs<ctxT, argTs>, rawArgs: string[], context: ctxT): void | Promise<void>;

  public destroy (): void | Promise<void> {}
}

export type UnknownBaseCommand<ctxT extends {}> = BaseCommand<ctxT, ReadonlyArray<UnknownBaseType<ctxT>> | []>;

export type CommandConstructor<ctxT extends {}, T extends UnknownBaseCommand<ctxT>> = new () => T;
