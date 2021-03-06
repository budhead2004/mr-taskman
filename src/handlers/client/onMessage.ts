/* eslint-disable indent */
import { Message } from "discord.js";
import { manager } from "../../index";
import config from "../../config";
import validate from "../../utils/validate";
import setPresence from "../../utils/setPresence";
import Command from "../../interfaces/command";

export default function (message: Message): void {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  setPresence(message);

  // Get Arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const first = args.shift().toLowerCase();

  // Get Command
  const { commands } = manager;
  const command =
    commands.get(first) ||
    commands.find((cmd: Command) => cmd.aliases?.includes(first));
  if (!command) {
    message.reply(config.messages.command());
    return;
  }

  const blacklist = [];
  switch (first) {
    case "task":
      blacklist.push("cooldown");
      break;
    case "guild":
      blacklist.push("cooldown");
      break;
    default:
      break;
  }
  // Execute
  try {
    const isAllowed = validate(message, command, args, { blacklist });
    if (isAllowed) command.execute(message, args);
  } catch (err) {
    console.log(err);
    message.reply(config.messages.error());
  }
}
