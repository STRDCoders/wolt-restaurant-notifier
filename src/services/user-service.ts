import { IUser, UserDTO, UserModel } from "../model/user-model";
import { WoltWebClient } from "../web-client/wolt";
import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";

const logger: Logger = LoggerFactory.getLogger("user-service");

export interface IUserService {
  getUser(chatId: string): Promise<IUser>;
  registerUser(chatId: string): Promise<UserDTO>;
}

export class UserService implements IUserService {
  async getUser(chatId: string): Promise<IUser> {
    return await UserModel.findByChatId(chatId);
  }

  async registerUser(chatId: string): Promise<UserDTO> {
    const user = await UserModel.createUser(chatId);
    return user as UserDTO;
  }

  async addAddress(chatId: string, addressId: string): Promise<UserDTO> {
    logger.info(`Request to add address ${addressId} to user ${chatId}`);
    const user = await UserModel.findByChatId(chatId);
    if (!user) {
      throw new Error(`User was not found while trying to add address for chatId: ${chatId}`);
    }
    if (user.addresses.find((address) => address.addressId === addressId)) {
      logger.warn(`User ${user.chatId} already has address ${addressId}, skipping`);
      return user as UserDTO;
    }
    const geoLocation = await WoltWebClient.getAddressGeo(addressId);
    await user.addAddress(addressId, [geoLocation.geometry.location.lng, geoLocation.geometry.location.lat]);
    logger.info(`User ${user.chatId} added address ${addressId} successfully`);
    return user as UserDTO;
  }
}

export const userService = new UserService();
