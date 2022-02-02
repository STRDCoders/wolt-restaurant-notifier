import { LoggerFactory } from "./utils/logger-factory";
import { Logger } from "winston";

const logger: Logger = LoggerFactory.getLogger("main");

function startup() {
  logger.info("App is starting...");
}

startup();
