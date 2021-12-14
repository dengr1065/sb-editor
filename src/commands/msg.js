const { readdir, readFile } = require("fs/promises");
const { trustedRoles } = require("../../config.json");

const NEW_LINK =
    "[submit a pull request](https://github.com/dengr1065" +
    "/sb-editor/tree/master/messages)";
const messages = {};

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    let file = msg.content.split(/\s+/).slice(1).join(" ");
    const fast = msg.content.startsWith("!");

    if (fast) {
        file = msg.content.slice(1);
    }

    const content = messages[file.toLowerCase()];
    if (!content) {
        throw new Error(`No such message. To create one, ${NEW_LINK}.`);
    }

    await msg.channel.send(content);
    if (fast && msg.deletable) {
        await msg.delete();
    }
}

/**
 * @param {import("discord.js").Message} msg
 */
async function watcher(msg) {
    if (msg.author.bot) return;
    if (!msg.content.startsWith("!")) return;

    const memberRoles = msg.member.roles.cache;
    if (!memberRoles.some((r) => trustedRoles.includes(r.id))) return;

    try {
        await execute(msg);
    } catch {
        /* ignore errors in non-interactive mode */
    }
}

module.exports = {
    name: "sbe:msg",
    execute,
    load: async (client) => {
        const files = await readdir("./messages");
        for (const file of files) {
            messages[file] = await readFile(`./messages/${file}`, "utf-8");
        }

        client.on("messageCreate", watcher);
    },
    unload: (client) => {
        client.off("messageCreate", watcher);

        for (const file in messages) {
            delete messages[file];
        }
    }
};
