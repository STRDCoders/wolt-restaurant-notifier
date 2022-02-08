import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { Constants } from "../utils/constants";
import { Bot, BotError, session } from "grammy";
import { MainMenuMiddleware } from "../bot-menus/main-menu";
import { MenuMiddleware } from "grammy-inline-menu";
import { UserService, userService } from "./user-service";
import { UserDTO } from "../model/user-model";
import { SessionDataAddressAddSearch } from "../bot-menus/address-management-menu";
import { WoltAddressSearchResult, WoltWebClient } from "../web-client/wolt";
import { BasicContext } from "../bot-menus/menu";
import { SessionDataRestaurantAdd } from "../bot-menus/ping-menu";

const logger: Logger = LoggerFactory.getLogger("bot-service");

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum SessionStateType {
  none = "none",
  addressAddSearch = "address-add-search",
  addressAddChoose = "address-add-choose",
  pingAddRestaurant = "ping-add-restaurant",
  pingAddRestaurantChoose = "ping-add-restaurant-choose",
}

export type SessionData = {
  currentState: SessionStateType;
  user: UserDTO | null;
} & SessionDataAddressAddSearch &
  SessionDataRestaurantAdd;

function initial(): SessionData {
  return { currentState: SessionStateType.none, user: null, addressSearchResult: [], restaurantsSearchResult: [] };
}

export class TelegramBotService {
  private bot: Bot<BasicContext>;
  private readonly mainMenuMiddleware: MenuMiddleware<BasicContext>;

  constructor(private readonly userService: UserService = userService) {
    this.bot = new Bot(Constants.botToken);
    this.mainMenuMiddleware = new MainMenuMiddleware().getMenu();
    this.initBotMiddleware();
    this.initBotCommands();
    this.bot.api.setMyCommands([
      {
        command: "address",
        description: "Manage your addresses",
      },
      {
        command: "ping",
        description: "Register to a restaurant",
      },
    ]);

    this.bot.start();
  }

  private initBotMiddleware() {
    // Initial global middleware for bot
    this.bot.use(session({ initial }));
    this.bot.catch(async (errorHandler) => await this.handleError(errorHandler));
    this.bot.use(async (ctx: BasicContext, next: Function) => await this.handleGuard(ctx, next));
    this.bot.use(async (ctx: BasicContext, next: Function) => await this.handleDebugLogging(ctx, next));
    this.bot.use(async (ctx: BasicContext, next: Function) => await this.handleSessionState(ctx, next));
    this.bot.use(this.mainMenuMiddleware);
  }

  private initBotCommands() {
    this.bot.command(
      "address",
      async (ctx: BasicContext, next: Function) => await this.handleAddressManagementRequest(ctx, next)
    );
    this.bot.command("help", async (ctx: BasicContext, next: Function) => await this.handleHelpRequest(ctx, next));
    this.bot.command("ping", async (ctx: BasicContext, next: Function) => await this.handlePingRequest(ctx, next));
  }

  private handleError = async (errorHandler: BotError<BasicContext>) => {
    logger.error(`Error occurred: ${errorHandler.error}`);
    await errorHandler.ctx.reply("An error occurred. Please try again later.");
  };

  private async handleDebugLogging(ctx: BasicContext, next: Function) {
    logger.debug(
      `Received message from: '${ctx.chat!!.id}', with state: '${ctx.session.currentState}', user in session: ${!!ctx
        .session.user}`
    );
    return await next();
  }

  private async handleGuard(ctx: BasicContext, next: Function) {
    if (ctx.chat && ctx.chat.id) {
      if (!ctx.session.user) {
        logger.debug(`Searching user ${ctx.chat.id} in db to add to session`);
        ctx.session.user = await this.userService.getUser(ctx.chat.id.toString());
        // Show registration message if the user was not found && is not in registration state
        if (!ctx.session.user && !ctx.callbackQuery?.data?.includes(Constants.bot.menu.actions.register)) {
          logger.debug(`User ${ctx.chat.id} not found in db, showing registration message`);
          await ctx.reply(Constants.bot.responses.preWelcome);
          await setTimeout(async () => {
            await this.mainMenuMiddleware.replyToContext(ctx, `/${Constants.bot.menu.actions.register}/`);
          }, 1000);
          return;
        }
      }
      return await next();
    }
    logger.error(`User ${ctx.from?.id} is not authorized(no chatId)`);
  }

  private async handleHelpRequest(ctx: BasicContext, next: Function) {
    await ctx.reply(Constants.bot.responses.help.registered);
    return await next();
  }

  private async handleAddressManagementRequest(ctx: BasicContext, next: Function) {
    await this.mainMenuMiddleware.replyToContext(ctx, "/address/");
    return await next();
  }

  private async handleSessionState(ctx: BasicContext, next: Function) {
    // In case the user switches a menu, we want to ignore state requests since they are not relevant & in some cases will cause the menu to re-appear
    if (!!ctx.callbackQuery?.data) {
      return await next();
    }
    switch (ctx.session.currentState) {
      case SessionStateType.addressAddSearch:
        if (!ctx.message || !ctx.message.text) {
          await this.mainMenuMiddleware.replyToContext(ctx, "/address/add/");
          break;
        }
        const addresses: Array<WoltAddressSearchResult> = await WoltWebClient.searchAddress(ctx.message.text);
        if (addresses.length === 0) {
          await ctx.reply(Constants.bot.responses.address.add.noResults);
          await this.mainMenuMiddleware.replyToContext(ctx, "/address/add/");
          break;
        }
        ctx.session.addressSearchResult = addresses;
        ctx.session.currentState = SessionStateType.addressAddChoose;
        await this.mainMenuMiddleware.replyToContext(ctx, "/address/add/choose/");
        break;
      case SessionStateType.pingAddRestaurant:
        if (!ctx.message || !ctx.message.text) {
          await this.mainMenuMiddleware.replyToContext(ctx, "/ping/add");
          break;
        }
        const restaurantResults = await WoltWebClient.restaurantSearch(
          ctx.message.text,
          ctx.session.user!!.addresses[0].geo
        );
        if (restaurantResults.length === 0) {
          await ctx.reply(Constants.bot.responses.ping.noResults);
          await this.mainMenuMiddleware.replyToContext(ctx, "/ping/add");
          break;
        }
        ctx.session.currentState = SessionStateType.pingAddRestaurantChoose;
        ctx.session.restaurantsSearchResult = restaurantResults;
        await this.mainMenuMiddleware.replyToContext(ctx, "/ping/choose/");
        break;
    }
    return await next();
  }

  private async handlePingRequest(ctx: BasicContext, next: Function) {
    // Check if the user in session has an address
    if (!ctx.session.user?.addresses || ctx.session.user.addresses.length === 0) {
      await ctx.reply(Constants.bot.responses.ping.noAddress);
      return await next();
    }
    await this.mainMenuMiddleware.replyToContext(ctx, `/${Constants.bot.menu.actions.ping.menu}/`);
  }
}
