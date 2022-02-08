import { MenuTemplate } from "grammy-inline-menu";
import { Constants } from "../utils/constants";
import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { userService } from "../services/user-service";
import { BasicContext, IMenu } from "./menu";

const logger: Logger = LoggerFactory.getLogger("register-menu");

export class RegisterMenu implements IMenu {
  private registrationTemplate: MenuTemplate<BasicContext> = new MenuTemplate(Constants.bot.responses.welcome);

  constructor() {
    this.registrationTemplate.interact("Register", Constants.bot.menu.actions.register, {
      do: async (ctx: BasicContext) => {
        logger.info(`Registering user with chatId: ${ctx.chat!!.id}`);
        ctx.session.user = await userService.registerUser(ctx.chat!!.id.toString());
        return `/${Constants.bot.menu.actions.address.address}/${Constants.bot.menu.actions.address.add}/`;
      },
    });
  }

  getMenu(): MenuTemplate<BasicContext> {
    return this.registrationTemplate;
  }
}
