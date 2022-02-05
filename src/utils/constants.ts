// Create a constant that holds an env variable called BOT_TOKEN
export class Constants {
  static readonly botToken: string = process.env.BOT_TOKEN!!;
  // Create a constant that holds an env variable called MONGO_URI that points to the MongoDB database, or a default value if it's not set in the environment variables
  static readonly mongoUri: string = process.env.MONGO_URI || "mongodb://localhost:27017/";

  static readonly botResponses = Object.freeze({
    welcome:
      "Hey There 👋 \n" +
      "I see that you are new here,\n" +
      "I was created by a lazy person, with lots of cravings for sweets & hamburgers, in a problematic city that contains thousands just like him.\n" +
      "Since the world is mean, deliveries are getting harder and harder - which is why I’m alive!\n" +
      "\n" +
      "So… Hi ☺️\n" +
      "My code name is WoltBot and I’m here to ping you whenever a restaurant you crave for is temporarily closed 😒\n" +
      "A few words on how I work: you will need to register and tell me where you live so I can spy on you.\n" +
      "Once you set up your address, you can start requesting pings from restaurants." +
      "As easy as that! \n" +
      "If the restaurant is currently not delivering to one of your addresses, I will notify you once that horrific event ends.\n" +
      "To start the registration, just press the registration button bellow.\n",
    help: Object.freeze({
      registered:
        "I can help you with the following commands:\n" +
        "/ping - Ping a restaurant\n" +
        "/address - Manage your addresses",
      notRegistered:
        "I can help you with the following commands:\n" + "/start - Register to receive pings from restaurants\n",
    }),
  });
}
