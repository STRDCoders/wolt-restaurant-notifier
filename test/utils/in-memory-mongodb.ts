import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseConnector } from "../../src/services/MongooseConnector";

export class InMemoryMongodbConnector {
  private static db = new MongoMemoryServer();

  static async stop(): Promise<void> {
    await MongooseConnector.disconnect();
    await this.db.stop();
    this.db = new MongoMemoryServer();
  }

  static async start(): Promise<void> {
    await this.db.start();
    await MongooseConnector.connect(this.db.getUri());
  }
}
