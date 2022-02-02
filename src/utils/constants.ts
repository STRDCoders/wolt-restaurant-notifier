// Create a constant that holds an env variable called BOT_TOKEN
export class Constants {
  static readonly botToken: string = process.env.BOT_TOKEN!!;
}
