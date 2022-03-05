import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import EventEmitter from 'events';
import { CommandGroupManager } from './CommandGroupManager';
import { InhibitorManager } from './Inhibitor';
import { Localization, LocalizationOptions } from './Localization';
import { Memoize } from 'typescript-memoize';
import { CommandManager } from './CommandManager';
import { escapeRegExp } from 'lodash';
import { UserError } from './Errors';
import { ArgumentExtractor } from './arguments/extractors/base';
import { basicExtractor } from './arguments/extractors/basicExtractor';

export interface CommanderoManagerOptions {
  localization: LocalizationOptions;

  commandPrefix?: string;
  owners?: string[] | Set<string>;

  isEnabled?: boolean;

  defaultArgumentExtractor?: ArgumentExtractor;
}

export type CommanderoPrefixResolver<ctxT extends {}> = (context: ctxT) => string;

export type ClientMessageHandler<ctxT extends {}> = (context: ctxT) => (void | Promise<void>);

export class CommanderoManager<ctxT extends {}> extends EventEmitter {
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

  public constructor (options: CommanderoManagerOptions) {
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

    const prefix = await this.handleMessagePrefix(message, context);
    const regexp = await this.handlePrefixRegExp(prefix);
    const data = regexp.exec(message);
    if (data == null) return;
    let [, commandName, strArgs = ''] = data;
    commandName = commandName.toLowerCase();

    const command = this.commands.cache.get(commandName);
    if (command == null) return;

    await command.handleMessage(strArgs, context);
  }

  public async handleMessageError (message: string, context: ctxT, err: Error): Promise<void> {
    try {
      if (err instanceof UserError) {
        await this.handleMessageUserError(message, context, err);
      } else {
        throw err;
      }
    } catch (err) {
      await this.handleMessageThrowableError(message, context, err as Error);
    }
  }

  public async handleMessageThrowableError (message: string, context: ctxT, err: Error): Promise<void> {
    console.log(err);
  }

  public async handleMessageUserError (message: string, context: ctxT, err: UserError): Promise<void> {
    const locale = await this.handleMessageLocale(message, context);
    const msg = this.localization.translateUnsafe(locale, err.message) ?? this.localization.translateUnsafe(locale, 'error.unknown') ?? err.message;
    throw new Error(msg, { cause: err });
  }

  public async handleMessageLocale (message: string, context: ctxT): Promise<string> {
    return 'en';
  }

  public async handleMessagePrefix (message: string, context: ctxT): Promise<string | undefined> {
    return this.commandPrefix;
  }

  @Memoize({})
  public async handlePrefixRegExp (prefix: string | undefined): Promise<RegExp> {
    return new RegExp(`^${escapeRegExp(prefix ?? '')}\\s*(.+)$`, 'i');
  }
}
