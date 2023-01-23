import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import botConfig from "./config.js";

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.login(botConfig.discordToken);
