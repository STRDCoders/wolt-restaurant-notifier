// Create a constant that holds an env variable called BOT_TOKEN
export class Constants {
  static readonly botToken: string = process.env.BOT_TOKEN!!;
  // Create a constant that holds an env variable called MONGO_URI that points to the MongoDB database, or a default value if it's not set in the environment variables
  static readonly mongoUri: string = process.env.MONGO_URI || "mongodb://localhost:27017/";

  static readonly bot = Object.freeze({
    responses: Object.freeze({
      invalidResponse: "Sorry, I didn't understand that. Please try again.",
      preWelcome: "Please register first before continue chatting with me",
      welcome:
        "Hey There 👋 \n" +
        "I see that you are new here,\n" +
        "I was created by a lazy person, with lots of cravings for sweets & hamburgers, in a problematic city that contains thousands just like him.\n" +
        "Since the world is mean, deliveries are getting harder and harder - which is why I’m alive!\n" +
        "\n" +
        "So… Hi ☺️\n" +
        "My code name is WoltBot and I’m here to ping you whenever a restaurant you crave for is temporarily closed 😒\n" +
        "A few words on how I work: you will need to register and tell me where you live so I can spy on you.\n" +
        "Once you set up your address, you can start requesting pings from restaurantsSearchResult." +
        "As easy as that! \n" +
        "If the restaurant is currently not delivering to one of your addresses, I will notify you once that horrific event ends.\n" +
        "To start the registration, just press the registration button bellow.\n",
      address: Object.freeze({
        add: Object.freeze({
          noResults: "I couldn't find any addresses that match your input.",
          chooseInput: "Choose the correct address from the list below",
          done: "Your address has been added!",
        }),
      }),
      help: Object.freeze({
        registered:
          "I can help you with the following commands:\n" +
          "/ping - Ping a restaurant\n" +
          "/address - Manage your addresses",
      }),
      ping: Object.freeze({
        noAddress: "You need to register an address before you can request a restaurant notification",
        noResults: "I couldn't find any restaurantsSearchResult that match your input.",
        spy: (name: string) => `I will spy on ${name} 👀`,
      }),
    }),
    menu: Object.freeze({
      buttons: Object.freeze({
        registration: "Register",
        address: Object.freeze({
          add: "Add address",
          remove: "Remove address",
          changeAddress: "Change address",
        }),
        ping: Object.freeze({
          addRestaurant: "Add restaurant",
          chooseRestaurant: "Choose restaurant",
        }),
        cancel: "Cancel",
      }),
      actions: Object.freeze({
        register: "welcome",
        ping: Object.freeze({
          menu: "ping",
          add: "add",
          choose: "choose",
        }),
        address: Object.freeze({
          address: "address",
          add: "add",
        }),
      }),
    }),
  });

  static readonly woltApi = Object.freeze({
    endpoints: Object.freeze({
      addressSearch: "https://restaurant-api.wolt.com/v1/google/places/autocomplete/json?input=",
      addressGeoLocation: "https://restaurant-api.wolt.com/v1/google/geocode/json?place_id=",
      searchRestaurant: (name: string, lon: string, lat: string) =>
        `https://restaurant-api.wolt.com/v1/pages/search?q=${encodeURI(name)}&lat=${lat}&lon=${lon}`,
      restaurantInfo: (name: string) => `https://restaurant-api.wolt.com/v3/venues/slug/${encodeURI(name)}`,
    }),
  });
}
