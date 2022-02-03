import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseConnector } from "../../src/services/MongooseConnector";

// Create a util that connects to in-memory mongodb instance
export class InMemoryMongodbConnector {
  private static db = new MongoMemoryServer();

  static async stop(): Promise<void> {
    await MongooseConnector.disconnect();
    await this.db.stop();
    this.db = new MongoMemoryServer();
  }

  // Create a start function that will start the in-memory mongodb instance if it is not already running
  static async start(): Promise<void> {
    await this.db.start();
    await MongooseConnector.connect(this.db.getUri());
  }
}
