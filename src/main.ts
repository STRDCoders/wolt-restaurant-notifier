import { LoggerFactory } from "./utils/logger-factory";
import { Logger } from "winston";
import { MongooseConnector } from "./utils/MongooseConnector";
import { Constants } from "./utils/constants";
import { TelegramBotService } from "./services/telegram-bot-service";
import { UserService } from "./services/user-service";
import { PingCyclerService } from "./services/ping-cycler-service";
const logger: Logger = LoggerFactory.getLogger("main");

async function startup() {
  logger.info("App is starting...");
  await MongooseConnector.connect(Constants.mongoUri);
  const userService = new UserService();
  await new TelegramBotService(userService);
  setInterval(() => {
    PingCyclerService.run();
  }, 1000 * 30);
}

startup().then(() => logger.info("Initialized"));
