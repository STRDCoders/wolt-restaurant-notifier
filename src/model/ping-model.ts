import { UserDTO } from "./user-model";
import { Document, model, Model, Schema } from "mongoose";
import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";

export interface RestaurantMonitorDTO {
  slug: string;
  users: Array<UserDTO>;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RestaurantMonitorSchema = new Schema<IRestaurantMonitor, IRestaurantMonitorModel>({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  name: {
    type: String,
    required: true,
  },
});

export interface IRestaurantMonitor extends Document, RestaurantMonitorDTO {
  addUser(user: UserDTO): Promise<void>;
}

export interface IRestaurantMonitorModel extends Model<IRestaurantMonitor> {
  monitorRestaurant(restaurantSlug: string, names: string, user: UserDTO): Promise<IRestaurantMonitor>;
  findRestaurantMonitor(restaurantSlug: string): Promise<IRestaurantMonitor>;
}

RestaurantMonitorSchema.statics.monitorRestaurant = async function (
  restaurantSlug: string,
  name: string,
  user: IRestaurantMonitor
): Promise<IRestaurantMonitor> {
  logger.info(`Creating new restaurant monitor for restaurant ${restaurantSlug}`);
  const restaurantMonitor = new this({
    slug: restaurantSlug,
    name: name,
    users: [user],
  });
  return restaurantMonitor.save();
};

RestaurantMonitorSchema.statics.findRestaurantMonitor = async function (restaurantSlug: string) {
  return this.findOne({ slug: restaurantSlug }).populate("users");
};

RestaurantMonitorSchema.methods.addUser = async function (user: UserDTO): Promise<void> {
  if (this.users.find((u: UserDTO) => u.chatId === user.chatId)) {
    logger.warn(`User is trying to register to already monitored restaurant: ${this.slug}`);
    return;
  }
  logger.info(`Adding user to restaurant monitor ${this.slug}`);
  this.users.push(user);
  await this.save();
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RestaurantMonitorModel: IRestaurantMonitorModel = model<IRestaurantMonitor, IRestaurantMonitorModel>(
  "RestaurantMonitorDTO",
  RestaurantMonitorSchema,
  "restaurant-monitors"
);
const logger: Logger = LoggerFactory.getLogger(RestaurantMonitorModel.name);
