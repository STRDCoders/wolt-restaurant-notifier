import { Model, model, Schema, Document } from "mongoose";
import { LoggerFactory } from "../utils/logger-factory";
import { Logger } from "winston";

export interface GeoDTO {
  type: "Point";
  // longitude comes first in a GeoJSON coordinate array, not latitude - by 'Mongoos' docs.
  coordinates: [number, number];
}

export interface AddressDTO {
  addressId: string;
  geo: GeoDTO;
}

export interface UserDTO {
  chatId: string;
  timestamp: number;
  addresses: AddressDTO[];
}

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const UserSchema = new Schema<IUser, IUserModel>({
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  addresses: [
    {
      addressId: {
        type: String,
        required: true,
        unique: false,
      },
      geo: {
        type: pointSchema,
        index: "2dsphere",
      },
    },
  ],
});

export interface IUser extends Document, UserDTO {
  addAddress(addressId: string, geo: [number, number]): Promise<IUser>;
}

export interface IUserModel extends Model<IUser> {
  deleteUserByChatId(chatId: string): Promise<void>;
  findByChatId(chatId: string): Promise<IUser>;
  createUser(chatId: string): Promise<IUser>;
}

UserSchema.statics.findByChatId = async function (chatId: string) {
  return this.findOne({ chatId: chatId });
};

UserSchema.statics.createUser = async function (chatId: string) {
  logger.info(`Creating user with chatId: ${chatId}`);
  const user = await this.findByChatId(chatId);
  if (user) {
    throw new Error(`User with chatId: ${chatId} already exists`);
  }
  return (await UserModel.create({
    chatId: chatId,
    timestamp: Date.now(),
    addresses: [],
  })) as IUser;
};

UserSchema.methods.addAddress = async function (addressId: string, geo: [number, number]) {
  const address: AddressDTO = {
    addressId: addressId,
    geo: {
      type: "Point",
      coordinates: geo,
    },
  };
  if (this.addresses.find((a: AddressDTO) => a.addressId === addressId)) {
    throw new Error(`Address with addressId: ${addressId} already exists in user with chatId: ${this.chatId}`);
  }
  this.addresses.push(address);
  return await this.save();
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserModel: IUserModel = model<IUser, IUserModel>("User", UserSchema, "users");
const logger: Logger = LoggerFactory.getLogger(UserModel.name);
