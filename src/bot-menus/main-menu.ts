import { MenuMiddleware, MenuTemplate } from "grammy-inline-menu";
import { Context, SessionFlavor } from "grammy";
import { addressManagementTemplate, registrationTemplate } from "./user-menu";
import { SessionData } from "../services/telegram-bot-service";

export type BasicContext = Context & SessionFlavor<SessionData>;

export class MainMenuMiddleware {
  private mainTemplate: MenuTemplate<BasicContext> = new MenuTemplate("user-menu");
  private readonly mainMenuMiddleware;

  constructor() {
    this.registerTemplates();
    this.mainMenuMiddleware = new MenuMiddleware("/", this.mainTemplate);
    console.log(this.mainMenuMiddleware.tree());
  }

  getMenu() {
    return this.mainMenuMiddleware;
  }

  private registerTemplates(): void {
    this.mainTemplate.submenu("Welcome", "welcome", registrationTemplate);
    this.mainTemplate.submenu("Address management", "address", addressManagementTemplate);
  }
}
