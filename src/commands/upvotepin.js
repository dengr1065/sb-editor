import { config } from "../config.ts";

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    if (msg.content.toLowerCase().startsWith("sbe:upvotepin")) {
        throw new Error("You are not supposed to call this command");
    }
}

/**
 * Pins messages with enough upvotes.
 * @param {import("discord.js").PartialMessageReaction} preact
 */
async function watcher(preact) {
    // trust me on these partials
    const code = preact.emoji.id ?? preact.emoji.name;
    if (!config.upvoteEmojis.includes(code)) return;
    if (!config.upvoteWatchlist.includes(preact.message.channel.id)) return;

    try {
        const react = await preact.fetch();
        if (react.count < config.upvoteThreshold) return;

        const message = await react.message.fetch();

        if (message.attachments.size == 0) {
            // The message has no attachments - not worth pinning
            return;
        }

        if (!message.pinned) {
            await message.pin();
        }
    } catch (err) {
        /* failed to fetch or pin */
        console.warn("Failed to pin message:", err);
    }
}

export default {
    name: "sbe:upvotepin",
    execute,
    load: (client) => {
        if (config.upvoteThreshold > 0) {
            client.on("messageReactionAdd", watcher);
        }
    }
};
