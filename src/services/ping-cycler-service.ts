import { WoltWebClient } from "../web-client/wolt";
import { restaurantService } from "./restaurant-monitor-service";
import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { IRestaurantMonitor } from "../model/ping-model";
import { Bot } from "grammy";
import { Constants } from "../utils/constants";

const logger: Logger = LoggerFactory.getLogger("restaurant-monitor-cycler");

export class PingCyclerService {
  private static bot = new Bot(Constants.botToken);

  public static async run() {
    logger.info("Starting ping cycler");
    const restaurantMonitors = await restaurantService.getAllMonitoredRestaurants();
    for (let i = 0; i < restaurantMonitors.length; i++) {
      // run everything with a 200ml timeout
      setTimeout(async () => {
        await this.handleRestaurantMonitor(restaurantMonitors[i]);
      }, 200 * i);
    }
  }

  private static async handleRestaurantMonitor(restaurant: IRestaurantMonitor) {
    logger.debug(`Scanning ${restaurant.slug}`);
    const result = await WoltWebClient.restaurantInfo(restaurant.slug);

    if (!result.online || !result.delivery_specs.delivery_enabled || result.alive === 0) {
      logger.debug(`Restaurant ${restaurant.slug} is not available`);
      return;
    }

    logger.info(`Restaurant ${restaurant.slug} is available`);
    for (const user of restaurant.users) {
      try {
        await PingCyclerService.bot.api.sendMessage(
          user.chatId,
          Constants.bot.responses.ping.available(restaurant.name),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          { parse_mode: "Markdown" }
        );
      } catch (e) {
        logger.error(`Error sending message to ${user.chatId} on restaurant ${restaurant.slug}`);
      }
    }

    await restaurantService.deleteRestaurantMonitor(restaurant.slug);
  }
}
