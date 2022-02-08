import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { UserDTO } from "../model/user-model";
import { IRestaurantMonitor, RestaurantMonitorModel } from "../model/ping-model";

const logger: Logger = LoggerFactory.getLogger("restaurant-monitor-service");

export interface IRestaurantMonitorService {
  monitorRestaurant(restaurantSlug: string, restaurantName: string, user: UserDTO): Promise<void>;
  getAllMonitoredRestaurants(): Promise<IRestaurantMonitor[]>;
}

class RestaurantMonitorService implements IRestaurantMonitorService {
  public async monitorRestaurant(restaurantSlug: string, restaurantName: string, user: UserDTO): Promise<void> {
    try {
      const restaurantMonitor: IRestaurantMonitor = await RestaurantMonitorModel.findRestaurantMonitor(restaurantSlug);
      if (restaurantMonitor) {
        if (!restaurantMonitor.users.find((u: UserDTO) => u.chatId === user.chatId)) {
          await restaurantMonitor.addUser(user);
        } else {
          logger.info(`User ${user.chatId} is already monitoring ${restaurantName}, ignoring...`);
          return;
        }
      } else {
        await RestaurantMonitorModel.monitorRestaurant(restaurantSlug, restaurantName, user);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  public async getAllMonitoredRestaurants(): Promise<IRestaurantMonitor[]> {
    try {
      return await RestaurantMonitorModel.getAllMonitoredRestaurants();
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  public async deleteRestaurantMonitor(restaurantSlug: string): Promise<void> {
    try {
      logger.info(`Deleting restaurant monitor ${restaurantSlug}`);
      await RestaurantMonitorModel.deleteRestaurantMonitor(restaurantSlug);
    } catch (error) {
      logger.error(error);
    }
  }
}

export const restaurantService = new RestaurantMonitorService();
