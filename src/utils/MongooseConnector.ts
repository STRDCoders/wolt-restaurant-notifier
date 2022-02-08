import mongoose from "mongoose";
import { LoggerFactory } from "./logger-factory";

/* Create and export a class called MongoooseConnector
  that has a function that is called "connect" that receives a uri string, and connects to mongodb with it and with username and password from env property,
  logging the status of the operation.
  The class should also include disconnect function that disconnects from mongodb.
  The class should also include isConnected function that returns a boolean indicating whether the connection is open.
  */

// Create logger called MongooseConnector
const logger = LoggerFactory.getLogger("MongooseConnector");

export class MongooseConnector {
  public static async connect(uri: string): Promise<void> {
    logger.info("Connecting to MongoDB...");

    mongoose.connection.on("error", (err: any) => {
      logger.error("Mongoose default connection error: " + err);
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
}
