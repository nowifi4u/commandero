import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import EventEmitter from 'events';
import { CommandGroupManager } from './CommandGroupManager';
import { InhibitorManager } from './Inhibitor';
import { Localization, LocalizationKeyError, LocalizationOptions } from './Localization';
import { Memoize } from 'typescript-memoize';
import { CommandManager } from './CommandManager';
import { splitArgs } from './util/String';
import { escapeRegExp } from 'lodash';
import { UserError } from './Errors';
import { ArgumentExtractor } from './arguments/extractors/base';
import { basicExtractor } from './arguments/extractors/basicExtractor';

export interface CommandManagerOptions {
  localization: LocalizationOptions;

  commandPrefix?: string;
  owners?: string[] | Set<string>;

  isEnabled?: boolean;

  defaultArgumentExtractor?: ArgumentExtractor;
}

export type CommandPrefixResolver<ctxT extends {}> = (context: ctxT) => string;

export type ClientMessageHandler<ctxT extends {}> = (context: ctxT) => (void | Promise<void>);

export class CommandsManager<ctxT extends {}> extends EventEmitter {
  @IsOptional()
  @IsString()
  @MinLength(1)
  public commandPrefix?: string;

  @IsBoolean()
  public isEnabled: boolean;

  public defaultArgumentExtractor: ArgumentExtractor;

  public readonly localization: Localization;
  public readonly groups: CommandGroupManager<ctxT> = new CommandGroupManager(this);
  public readonly commands: CommandManager<ctxT> = new CommandManager(this);
  public readonly inhibitors: InhibitorManager<ctxT> = new InhibitorManager(this);

  public messageHandler?: ClientMessageHandler<ctxT>;

  public constructor (options: CommandManagerOptions) {
    super();

    this.commandPrefix = options.commandPrefix;
    this.defaultArgumentExtractor = options.defaultArgumentExtractor ?? basicExtractor;
    this.isEnabled = options.isEnabled ?? true;

    this.localization = new Localization(options.localization);
  }

  public init (): void {
    this.isEnabled = true;
  }

  public destroy (): void {
    this.isEnabled = false;
  }

  public async handleMessage (message: string, context: ctxT): Promise<void> {
    await this.inhibitors.checkThrow(message, context);

    const prefix = await this.handleMessagePrefix(context);
    const regexp = await this.handlePrefixRegExp(prefix);
    const data = regexp.exec(message);
    if (data == null) return;
    let [, commandName, strArgs = ''] = data;
    commandName = commandName.toLowerCase();

    const command = this.commands.cache.get(commandName);
    if (command == null) return;

    await command.handleMessage(strArgs, context);
  }

  public async handleMessageError (context: ctxT, err: Error): Promise<void> {
    try {
      if (err instanceof UserError) {
        await this.handleMessageUserError(context, err);
      } else {
        throw err;
      }
    } catch (err) {
      await this.handleMessageThrowableError(context, err as Error);
    }
  }

  public async handleMessageThrowableError (context: ctxT, err: Error): Promise<void> {
    if (err instanceof UserError) {
      await this.handleMessageUserError(context, err);
    }
    throw err;
  }

  public async handleMessageUserError (context: ctxT, err: UserError): Promise<string> {
    const locale = await this.handleMessageLocale(context);
    const message = this.localization.translateUnsafe(locale, err.message) ?? this.localization.translateUnsafe(locale, 'error.unknown');
    if (message == null) throw new LocalizationKeyError(err.message);
    return message;
  }

  public async handleError (err: unknown): Promise<void> {
    console.error(err);
  }

  public async handleMessageLocale (context: ctxT): Promise<string> {
    return 'en';
  }

  public async handleMessagePrefix (context: ctxT): Promise<string | undefined> {
    return this.commandPrefix;
  }

  public async parseArguments (strArgs: string): Promise<string[]> {
    return splitArgs(strArgs);
  }

  @Memoize({})
  public async handlePrefixRegExp (prefix: string | undefined): Promise<RegExp> {
    return new RegExp(`^${escapeRegExp(prefix ?? '')}(?:\\s+(.+))?$`);
  }
}
