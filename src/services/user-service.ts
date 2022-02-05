import { IUser, UserDTO, UserModel } from "../model/user-model";

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
}

export const userService = new UserService();
