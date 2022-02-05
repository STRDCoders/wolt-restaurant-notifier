import { createBackMainMenuButtons, MenuTemplate } from "grammy-inline-menu";
import { Context } from "grammy";
import { Constants } from "../utils/constants";
import { BasicContext } from "./main-menu";
import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { userService } from "../services/user-service";
import { SessionStateType } from "../services/telegram-bot-service";

const logger: Logger = LoggerFactory.getLogger("user-menu");

export const registrationTemplate: MenuTemplate<BasicContext> = new MenuTemplate(Constants.botResponses.welcome);
registrationTemplate.interact("Register", "register-user", {
  do: async (ctx: BasicContext) => {
    logger.info(`Registering user with chatId: ${ctx.chat!!.id}`);
    ctx.session.user = await userService.registerUser(ctx.chat!!.id.toString());
    ctx.session.currentState = SessionStateType.addressAdd;
    return "/address/add";
  },
});

export const addressManagementTemplate: MenuTemplate<BasicContext> = new MenuTemplate(
  (_) => "Please choose the action you want to perform"
);
const addressAddTemplate: MenuTemplate<Context> = new MenuTemplate<Context>("Please enter the address you want to add");
const addressRemoveTemplate: MenuTemplate<Context> = new MenuTemplate<Context>(
  "Please choose the address you want to remove"
);

addressManagementTemplate.submenu("Add address", "add", addressAddTemplate);
addressManagementTemplate.submenu("Remove address", "remove", addressRemoveTemplate);

addressAddTemplate.manualRow(createBackMainMenuButtons("Cancel", "Cancel"));
addressRemoveTemplate.manualRow(createBackMainMenuButtons("Cancel", "Cancel"));
