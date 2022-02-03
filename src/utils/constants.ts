// Create a constant that holds an env variable called BOT_TOKEN
export class Constants {
  static readonly botToken: string = process.env.BOT_TOKEN!!;
  // Create a constant that holds an env variable called MONGO_URI that points to the MongoDB database, or a default value if it's not set in the environment variables
  static readonly mongoUri: string = process.env.MONGO_URI || "mongodb://localhost:27017/";
}
