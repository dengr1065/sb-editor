const { antiSpamEnabled, antiSpamRole } = require("../../config.json");

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

            // Mute the person
            if (msg.member.manageable) {
                await msg.member.roles.add(antiSpamRole);
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

module.exports = {
    name: "sbe:antispam",
    execute,
    load: (client) => {
        if (antiSpamEnabled) {
            client.on("messageCreate", watcher);
        }
    },
    unload: (client) => {
        if (antiSpamEnabled) {
            client.off("messageCreate", watcher);
        }
    }
};
