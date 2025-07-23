const { Client, Intents } = require("discord.js");
const { token, disabledCommands } = require("../config.json");

const commands = require("./commands");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ["MESSAGE", "REACTION"],
    allowedMentions: {
        repliedUser: true
    }
});

async function loadCommands() {
    const errors = [];

    for (const command of commands) {
        try {
            if (command.load) {
                await command.load(client);
            }
        } catch (err) {
            errors.push(command.name + ": " + err.message);
        }
    }

    return errors;
}

/**
 * Checks if the specified command is disabled in a guild.
 * @param {import("discord.js").Guild} guild
 * @param {string} command
 */
function isCommandDisabled(guild, command) {
    const guildId = guild.id;
    if (!Array.isArray(disabledCommands[guildId])) {
        // No commands specified for this guild
        return false;
    }

    return disabledCommands[guildId].includes(command);
}

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    const command = msg.content.split(/\s+/)[0].toLowerCase();
    const cmd = commands.find((cmd) => cmd.name == command);

    if (cmd === undefined) {
        return;
    }

    const disabled = isCommandDisabled(msg.guild, command);
    if (disabled) {
        await msg.reply("This command is not available in this server.");
        return;
    }

    try {
        await cmd.execute(msg);
    } catch (err) {
        const displayError =
            process.env.NODE_ENV == "development"
                ? err.stack ?? err.toString()
                : err.message;
        await msg.reply("Execution failed: " + displayError);
    }
});

loadCommands().then((errors) => {
    for (const error of errors) {
        console.error(error);
    }

    console.log("Initial load complete.");
    client.login(token);
});
