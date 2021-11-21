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
 * @param {import("discord.js").PartialMessageReaction} preact
 */
async function watcher(preact) {
    // trust me on these partials
    const code = preact.emoji.id ?? preact.emoji.name;
    if (!upvoteEmojis.includes(code)) return;
    if (!upvoteWatchlist.includes(preact.message.channel.id)) return;

    try {
        const react = await preact.fetch();
        if (react.count < upvoteThreshold) return;

        const message = await react.message.fetch();
        if (!message.pinned) {
            await message.pin();
        }
    } catch {
        /* failed to fetch or pin */
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
