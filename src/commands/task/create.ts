import Discord from "discord.js";
import config from "../../config";
import GuildService from "../../services/guild";
import TaskService from "../../services/task";

const { messages } = config;

export = {
  name: "create",
  description: "creates task",
  usage: "<title>",
  args: true,
  guildOnly: true,
  category: "task",
  execute: async function (
    message: Discord.Message,
    args: Array<string>
  ): Promise<Discord.Message> {
    try {
      const foundGuild = await GuildService.fetch(message);

      if (foundGuild.channelIds.length < 1) {
        return message.reply("channels not set");
      }
      const task = await TaskService.create(args.join(" "), message.author.id);

      const userId = message.author.id;

      const channels = foundGuild.channelIds.map((id) =>
        message.guild.channels.cache.get(id)
      );
      // Using a type guard to narrow down the correct type
      if (!areTextChannels(channels)) return;

      const embed = TaskService.formatTaskEmbed(message, task);
      channels.forEach((channel) => {
        channel.send(embed).then((sent) => {
          // Add MessageId To Task
          task.messageId = `${sent.id.toString()}`;
          task.markModified("messageId");
          task.save().then((saved) => {
            // Reference Task In Guild
            foundGuild.tasks.push(saved._id);
            foundGuild.markModified("tasks");
            // if (!foundGuild.selectedTasks.size) foundGuild.selectedTasks = new Map();
            // Select Task
            foundGuild.selectedTasks.set(userId, saved._id); // ALL THIS SHOULD BE MOVED TO THE SERVICE. COMMANDS SHOULDNT TOUCH MODELS
            foundGuild.markModified("selectedTasks");
            foundGuild.save();
          });
        });
      });

      return message.reply(
        `Task created in ${channels
          .map((channel) => `<#${channel.id}>`)
          .join(", ")}`
      );
    } catch (error) {
      if (error.code === 11000) {
        // likely a duplicate task title
        return message.reply(
          "Were you dropped on your head as a child? That title has already been used"
        );
      }
      return message.reply(messages.error());
    }
  },
};

function areTextChannels(
  channels: Discord.GuildChannel[]
): channels is Discord.TextChannel[] {
  return channels.every((channel) => channel instanceof Discord.TextChannel);
}
