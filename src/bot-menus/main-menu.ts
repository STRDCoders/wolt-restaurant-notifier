import { MenuMiddleware, MenuTemplate } from "grammy-inline-menu";
import { AddressManagementMenu } from "./address-management-menu";
import { BasicContext } from "./menu";
import { RegisterMenu } from "./register-menu";
import { Constants } from "../utils/constants";
import { PingMenu } from "./ping-menu";

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
    this.mainTemplate.submenu("Welcome", Constants.bot.menu.actions.register, new RegisterMenu().getMenu());
    this.mainTemplate.submenu("Ping", Constants.bot.menu.actions.ping.menu, new PingMenu().getMenu());
    this.mainTemplate.submenu(
      "Address management",
      Constants.bot.menu.actions.address.address,
      new AddressManagementMenu().getMenu()
    );
  }
}
