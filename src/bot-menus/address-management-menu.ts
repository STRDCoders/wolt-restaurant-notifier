import { deleteMenuFromContext, MenuTemplate } from "grammy-inline-menu";
import { Constants } from "../utils/constants";
import { SessionStateType } from "../services/telegram-bot-service";
import { BasicContext, IMenu, registerCancelButton } from "./menu";
import { WoltAddressSearchResult } from "../web-client/wolt";
import { userService } from "../services/user-service";

export interface SessionDataAddressAddSearch {
  addressSearchResult: WoltAddressSearchResult[];
}

export class AddressManagementMenu implements IMenu {
  private mainTemplate: MenuTemplate<BasicContext> = new MenuTemplate("Please choose the action you want to perform");
  private addressAddSearchTemplate: MenuTemplate<BasicContext> = new MenuTemplate(async (ctx: BasicContext) => {
    ctx.session.currentState = SessionStateType.addressAddSearch;
    return "Please enter the address you want to add";
  });
  private addressAddChooseTemplate: MenuTemplate<BasicContext> = new MenuTemplate(
    Constants.bot.responses.address.add.chooseInput
  );

  constructor() {
    this.buildAddressMainTemplate();
    this.buildAddressAddTemplate();
  }

  private static async handleAddressChosen(ctx: BasicContext, key: string) {
    ctx.session.currentState = SessionStateType.none;
    const chosenAddress = ctx.session.addressSearchResult[parseInt(key, 10)];
    ctx.session.user = await userService.addAddress(ctx.chat!!.id.toString(), chosenAddress.place_id);
    ctx.session.addressSearchResult = [];
    await ctx.reply(Constants.bot.responses.address.add.done);
  }

  public getMenu(): MenuTemplate<BasicContext> {
    return this.mainTemplate;
  }

  private buildAddressMainTemplate() {
    this.mainTemplate.submenu(
      Constants.bot.menu.buttons.address.add,
      Constants.bot.menu.actions.address.add,
      this.addressAddSearchTemplate
    );
    registerCancelButton(this.mainTemplate);
  }

  private buildAddressAddTemplate() {
    this.addressAddSearchTemplate.submenu("address-choose", "choose", this.addressAddChooseTemplate, {
      hide: (ctx) => ctx.session.currentState !== SessionStateType.addressAddChoose,
    });
    this.addressAddChooseTemplate.select(
      "choice",
      (ctx: BasicContext) =>
        Object.assign(
          {},
          ctx.session.addressSearchResult.map((addressItem) => addressItem.description)
        ),
      {
        isSet: (_) => false,
        set: async (ctx: BasicContext, key) => {
          await AddressManagementMenu.handleAddressChosen(ctx, key);
          await deleteMenuFromContext(ctx);
          return false;
        },
        columns: 1,
        maxRows: 8,
      }
    );
    this.addressAddChooseTemplate.interact(Constants.bot.menu.buttons.address.changeAddress, "change-address", {
      do: async (ctx: BasicContext) => {
        ctx.session.addressSearchResult = [];
        return "/address/add/";
      },
    });
    registerCancelButton(this.addressAddChooseTemplate);
  }
}
