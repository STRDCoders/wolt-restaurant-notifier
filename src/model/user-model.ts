import { Model, model, Schema, Document } from "mongoose";
import { LoggerFactory } from "../utils/logger-factory";
import { Logger } from "winston";

/* Create a mongodb model for "user" containing the following fields:
 - chatId: string - as primary key
 - timestamp: number - timestamp of creation
 - addresses: Array<AddressDTO> - array of addresses
Addresses are objects containing the following fields:
 - addressId: string - as primary key
 - geo: GeoDTO - geo object */
export interface GeoDTO {
  type: "Point";
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

// Create schema for the UserDTO model
// eslint-disable-next-line @typescript-eslint/naming-convention
const UserSchema = new Schema<IUser, UserModel>({
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
  addAddress(addressId: string, geo: [number, number]): Promise<void>;
}

export interface UserModel extends Model<IUser> {
  findByChatId(chatId: string): Promise<IUser>;
  createUser(chatId: string): Promise<IUser>;
}

UserSchema.statics.findByChatId = async function (chatId: string) {
  return this.findOne({ chatId: chatId });
};

UserSchema.statics.createUser = async function (chatId: string) {
  logger.info(`Creating user with chatId: ${chatId}`);
  return (await UserModel.create({
    chatId: chatId,
    timestamp: Date.now(),
    addresses: [],
  })) as IUser;
};

// Add address to the current user object, if address already in the user, return error
UserSchema.methods.addAddress = async function (addressId: string, geo: [number, number]) {
  logger.info(`Adding address with addressId: ${addressId} to user with chatId: ${this.chatId}`);
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
  return this.save();
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserModel: UserModel = model<IUser, UserModel>("UserDTO", UserSchema, "users");
const logger: Logger = LoggerFactory.getLogger(UserModel.name);
