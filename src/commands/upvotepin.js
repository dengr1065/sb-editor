const {
    upvotePinEnabled,
    upvoteThreshold,
    upvoteEmojis,
    upvoteWatchlist
} = require("../../config.json");

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
 * @param {(
 *     import("discord.js").PartialMessageReaction |
 *     import("discord.js").MessageReaction
 * )} preact
 */
async function watcher(preact) {
    // trust me on these partials
    const code = preact.emoji.id ?? preact.emoji.name;
    if (!upvoteEmojis.includes(code)) return;
    if (!upvoteWatchlist.includes(preact.message.channel.id)) return;

    if (preact.partial) {
        try {
            await preact.fetch();
        } catch {
            // message probably deleted
            return;
        }
    }
    /** @type {import("discord.js").MessageReaction} */
    const react = preact;

    if (react.count < upvoteThreshold) return;

    if (!react.message.pinned) {
        react.message.pin();
    }
}

module.exports = {
    name: "sbe:upvotepin",
    execute,
    load: (client) => {
        if (upvotePinEnabled) {
            client.on("messageReactionAdd", watcher);
        }
    },
    unload: (client) => {
        if (upvotePinEnabled) {
            client.off("messageReactionAdd", watcher);
        }
    }
};
