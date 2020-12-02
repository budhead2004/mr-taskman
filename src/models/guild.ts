import TaskInterface from "./task";
import mongoose, { Schema, Types } from "mongoose";

interface GuildBaseInterface extends mongoose.Document {
  guildId: string;
  channelIds: Array<string>;
  ownerId: string;
  roles: Record<string, string>; // name : id of a Discord.Role
  selectedTasks: Record<string, Types.ObjectId>;
}

export interface GuildInterface extends GuildBaseInterface {
  tasks: Types.Array<Schema.Types.ObjectId>;
}

export interface GuildPopulatedInterface extends GuildBaseInterface {
  tasks: Types.Array<typeof TaskInterface>;
}

const guildSchema = new Schema({
  guildId: String,
  channelIds: { type: [String], default: [] },
  ownerId: String,
  roles: Object,
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "tasks",
    },
  ],
  selectedTasks: { type: Object, default: {} },
});

const GuildModel = mongoose.model<GuildInterface>("guilds", guildSchema);

export default GuildModel;