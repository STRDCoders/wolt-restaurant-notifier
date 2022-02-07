import { LoggerFactory } from "./utils/logger-factory";
import { Logger } from "winston";
import { MongooseConnector } from "./utils/MongooseConnector";
import { Constants } from "./utils/constants";
import { TelegramBotService } from "./services/telegram-bot-service";
import { UserService } from "./services/user-service";
const logger: Logger = LoggerFactory.getLogger("main");

async function startup() {
  logger.info("App is starting...");
  await MongooseConnector.connect(Constants.mongoUri);
  // TODO - dependency injection
  const userService = new UserService();

  // new BotBot();
  await new TelegramBotService(userService);
}

startup().then(() => logger.info("Initialized"));
