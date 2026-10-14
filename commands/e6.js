const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("e6")
    .setDescription("e621")
    .addIntegerOption(option =>
      option
        .setName("id")
        .setDescription("Post ID")
        .setRequired(true)
    )
    .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel
   ]),

  async execute(interaction) {
    await interaction.reply("working...");
  }
};