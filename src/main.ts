import { LoggerFactory } from "./utils/logger-factory";
import { Logger } from "winston";
import { MongooseConnector } from "./services/MongooseConnector";
import { Constants } from "./utils/constants";

const logger: Logger = LoggerFactory.getLogger("main");

async function startup() {
  logger.info("App is starting...");
  await MongooseConnector.connect(Constants.mongoUri);
}

startup().then(() => logger.info("Initialized"));
