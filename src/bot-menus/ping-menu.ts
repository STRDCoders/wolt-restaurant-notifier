import { BasicContext, IMenu, registerCancelButton } from "./menu";
import { deleteMenuFromContext, MenuTemplate } from "grammy-inline-menu";
import { SessionStateType } from "../services/telegram-bot-service";
import { WoltRestaurantSearchResult } from "../web-client/wolt";
import { Constants } from "../utils/constants";
import { restaurantService } from "../services/restaurant-monitor-service";

export interface SessionDataRestaurantAdd {
  restaurantsSearchResult: WoltRestaurantSearchResult[];
}

export class PingMenu implements IMenu {
  private mainTemplate: MenuTemplate<BasicContext> = new MenuTemplate<BasicContext>("Choose an action to preform");
  private addRestaurantChoiceTemplate: MenuTemplate<BasicContext> = new MenuTemplate<BasicContext>(
    "Choose a restaurant to monitor"
  );

  constructor() {
    this.mainTemplate.interact(Constants.bot.menu.buttons.ping.addRestaurant, Constants.bot.menu.actions.ping.add, {
      do: async (ctx) => {
        await deleteMenuFromContext(ctx);
        await ctx.reply("Please type the name of the restaurant");
        ctx.session.currentState = SessionStateType.pingAddRestaurant;
        return false;
      },
    });
    this.mainTemplate.submenu(
      Constants.bot.menu.buttons.ping.chooseRestaurant,
      Constants.bot.menu.actions.ping.choose,
      this.addRestaurantChoiceTemplate,
      {
        hide: (ctx) => ctx.session.currentState !== SessionStateType.pingAddRestaurantChoose,
      }
    );
    this.addRestaurantChoiceTemplate.select(
      "choice",
      (ctx: BasicContext) =>
        Object.assign(
          {},
          ctx.session.restaurantsSearchResult.map(
            (addressItem) => `${addressItem.venue.name} - ${addressItem.venue.short_description}`
          )
        ),
      {
        isSet: (_) => false,
        set: async (ctx: BasicContext, key) => {
          const restaurant = ctx.session.restaurantsSearchResult[parseInt(key, 10)];
          await PingMenu.handleRestaurantChosen(ctx, restaurant);
          await deleteMenuFromContext(ctx);
          await ctx.reply(Constants.bot.responses.ping.spy(restaurant.venue.name));
          return false;
        },
        columns: 1,
        maxRows: 8,
      }
    );
    registerCancelButton(this.mainTemplate);
    registerCancelButton(this.addRestaurantChoiceTemplate);
  }

  private static async handleRestaurantChosen(ctx: BasicContext, restaurant: WoltRestaurantSearchResult) {
    ctx.session.currentState = SessionStateType.none;
    await restaurantService.monitorRestaurant(restaurant.venue.slug, restaurant.venue.name, ctx.session.user!!);
    return false;
  }

  getMenu(): MenuTemplate<BasicContext> {
    return this.mainTemplate;
  }
}
