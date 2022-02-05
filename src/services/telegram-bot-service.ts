import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { Constants } from "../utils/constants";
import { Bot, BotError, session } from "grammy";
import { BasicContext, MainMenuMiddleware } from "../bot-menus/main-menu";
import { MenuMiddleware } from "grammy-inline-menu";
import { userService, UserService } from "./user-service";
import { UserDTO } from "../model/user-model";

const logger: Logger = LoggerFactory.getLogger("bot-service");

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum SessionStateType {
  none = "none",
  addressAdd = "address-add",
  addressRemove = "address-remove",
}

export interface SessionData {
  currentState: SessionStateType;
  user: UserDTO | null;
}

function initial(): SessionData {
  return { currentState: SessionStateType.none, user: null };
}

export class TelegramBotService {
  private bot: Bot<BasicContext>;
  private readonly mainMenuMiddleware: MenuMiddleware<BasicContext>;

  constructor(private readonly userService: UserService = userService) {
    this.bot = new Bot(Constants.botToken);
    this.mainMenuMiddleware = new MainMenuMiddleware().getMenu();

    // Initial global middleware for bot
    this.bot.use(session({ initial }));
    this.bot.catch(async (errorHandler) => await this.handleError(errorHandler));
    this.bot.use(async (ctx: BasicContext, next: Function) => await this.handleGuard(ctx, next));

    // Initial middleware for menus & commands
    this.bot.use(async (ctx: BasicContext, next: Function) => await this.handleDebugLogging(ctx, next));
    this.bot.use(async (ctx: BasicContext, next: Function) => await this.handleSessionState(ctx, next));
    this.bot.command("start", async (ctx: BasicContext, next: Function) => await this.handleStartRequest(ctx, next));
    this.bot.command("help", async (ctx: BasicContext, next: Function) => await this.handleHelpRequest(ctx, next));

    this.bot.use(this.mainMenuMiddleware);

    this.bot.start();
    logger.info("Telegram bot service initialized");
  }

  private handleError = async (errorHandler: BotError<BasicContext>) => {
    logger.error(`Error occurred: ${errorHandler.error}`);
    await errorHandler.ctx.reply("An error occurred. Please try again later.");
  };

  private async handleDebugLogging(ctx: BasicContext, next: Function) {
    logger.info(`Received message from ${ctx.chat!!.id}`);
    if (ctx.callbackQuery) {
      console.log("callback data just happened", ctx.callbackQuery);
    }
    return await next();
  }

  private async handleGuard(ctx: BasicContext, next: Function) {
    if (ctx.chat && ctx.chat.id) {
      if (!ctx.session.user) {
        logger.debug(`Loading user ${ctx.chat.id} to session`);
        ctx.session.user = await this.userService.getUser(ctx.chat.id.toString());
      }
      return await next();
    }
    logger.error(`User ${ctx.from?.id} is not authorized(no chatId)`);
  }

  private async handleSessionState(ctx: BasicContext, next: Function) {
    if (ctx.chat && ctx.chat.id) {
      if (!ctx.session.user) {
        logger.debug(`Loading user ${ctx.chat.id} to session`);
        ctx.session.user = await this.userService.getUser(ctx.chat.id.toString());
      }
      return await next();
    }
    logger.error(`User ${ctx.from?.id} is not authorized(no chatId)`);
  }

  private async handleHelpRequest(ctx: BasicContext, next: Function) {
    await ctx.reply(Constants.botResponses.help.registered);
    return await next();
  }

  private async handleStartRequest(ctx: BasicContext, next: Function) {
    if (!ctx.session.user) {
      await this.mainMenuMiddleware.replyToContext(ctx, "/welcome/");
      return await next();
    }
    logger.warn(`User ${ctx.chat!!.id} tried to start bot but is already registered`);
    await ctx.reply("You are already registered");
    await ctx.reply(Constants.botResponses.help.registered);
    return await next();
  }
}
