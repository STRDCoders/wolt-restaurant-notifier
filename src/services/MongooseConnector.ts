import mongoose from "mongoose";
import { LoggerFactory } from "../utils/logger-factory";

/* Create and export a class called MongoooseConnector
  that has a function that is called "connect" that receives a uri string, and connects to mongodb with it and with username and password from env property,
  logging the status of the operation.
  The class should also include disconnect function that disconnects from mongodb.
  The class should also include isConnected function that returns a boolean indicating whether the connection is open.
  */

// Create logger called MongooseConnector
const logger = LoggerFactory.getLogger("MongooseConnector");

export class MongooseConnector {
  private static instance: MongooseConnector;
  private mongoose: mongoose.Mongoose;

  private constructor() {
    this.mongoose = mongoose;
  }

  public static getInstance(): MongooseConnector {
    if (!MongooseConnector.instance) {
      MongooseConnector.instance = new MongooseConnector();
    }
    return MongooseConnector.instance;
  }

  public static async connect(uri: string): Promise<void> {
    logger.info("Connecting to MongoDB...");

    mongoose.connection.on("connected", () => {
      logger.info("Opened connection to MongoDB");
    });
    mongoose.connection.on("error", (err: any) => {
      logger.error("Mongoose default connection error: " + err);
    });
    mongoose.connection.on("disconnected", () => {
      logger.info("Mongoose default connection disconnected");
    });
    mongoose.connection.on("close", () => {
      logger.warning("Mongoose default connection closed");
    });
    await mongoose.connect(uri, {
      autoIndex: true,
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
    });
  }

  public static async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  public static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}
