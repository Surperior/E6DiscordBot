const {
  REST,
  Routes
} = require("discord.js");

const commands = [
  {
    name: "getpost",
    description: "Get a e621 post by ID",
    options: [
      {
        name: "id",
        description: "Post ID",
        type: 4,
        required: true
      },
      {
        name: "info",
        description: "Include description, artist etc.",
        type: 5,
        default: false,
        required: false
      }
    ],
    contexts: [0,1,2]
  },
  {
    name: "fav",
    description: "Add a post to your favorites",
    options: [
      {
        name: "id",
        description: "Post ID",
        type: 4,
        required: true
      }
    ],
    contexts: [0,1,2]
  },
  {
    name: "login",
    description: "Your account token for the bot to favourite posts",
    options: [
      {
        name: "username",
        description: "Account username",
        type: 3,
        required: true
      },
      {
        name: "token",
        description: "Your account token",
        type: 3,
        required: true
      }
    ],
    contexts: [0,1,2]
  },
  {
    name: "Favourite",
    type: 3,
    contexts: [0,1,2]
  }
];

const rest = new REST().setToken("");
//X2YO3VRERsHqwhfhRMs-TrkvPbILG_Bv
(async () => {
  await rest.put(
    Routes.applicationCommands(""),
    { body: commands }
  );

  console.log("Commands registered");
})();