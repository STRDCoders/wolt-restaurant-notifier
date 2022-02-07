import { deleteMenuFromContext, MenuTemplate } from "grammy-inline-menu";
import { Context, SessionFlavor } from "grammy";
import { SessionData, SessionStateType } from "../services/telegram-bot-service";
import { Constants } from "../utils/constants";

export type BasicContext = Context & SessionFlavor<SessionData>;

export interface IMenu {
  getMenu(): MenuTemplate<BasicContext>;
}

export const registerCancelButton = (menuTemplate: MenuTemplate<BasicContext>) => {
  menuTemplate.interact(Constants.bot.menu.buttons.cancel, "cancel", {
    do: async (ctx: BasicContext) => {
      ctx.session.currentState = SessionStateType.none;
      await deleteMenuFromContext(ctx);
      return false;
    },
  });
};
