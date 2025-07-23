import { config } from "../config.ts";

const lastMessages = {};

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    if (msg.content.toLowerCase().startsWith("sbe:antispam")) {
        throw new Error("You are not supposed to call this command");
    }
}

/**
 * Does a couple of simple checks to combat automated spam.
 * @param {import("discord.js").Message} msg
 */
async function watcher(msg) {
    if (msg.author.bot) return;
    if (msg.attachments.size > 0) return;

    const { id } = msg.author;
    const time = Date.now();

    for (const user in lastMessages) {
        // Remove old last message information
        if (time - lastMessages[user].timestamp > 10e3) {
            delete lastMessages[user];
        }
    }

    if (lastMessages[id] && lastMessages[id].content == msg.content) {
        lastMessages[id].objects.push(msg);
        lastMessages[id].count++;
        lastMessages[id].timestamp = time;

        if (lastMessages[id].count > 3) {
            const messages = lastMessages[id].objects;
            lastMessages[id].objects = [];

            // Timeout the person
            if (
                msg.member.moderatable &&
                !msg.member.isCommunicationDisabled()
            ) {
                /**
                 * broken typings
                 * @type {import("discord.js").GuildMember}
                 */
                const member = msg.member;
                await member.timeout(36e5, "antispam: " + msg.content);
            }

            // Delete everything
            for (const message of messages) {
                if (message.deletable) {
                    await message.delete();
                }
            }
        }

        return;
    }

    const info = lastMessages[id] || {};
    info.content = msg.content;
    info.objects = [msg];
    info.count = 1;
    info.timestamp = time;

    lastMessages[id] = info;
}

export default {
    name: "sbe:antispam",
    execute,
    load: (client) => {
        if (config.antiSpamEnabled) {
            client.on("messageCreate", watcher);
        }
    }
};
