const { MessageAttachment } = require("discord.js");
const { compress } = require("../bin_file");

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    if (msg.attachments.size == 0) {
        await msg.reply("Please attach .json file to compress!");
        return;
    }

    const attachment = msg.attachments.first();
    if (attachment.size > 4 * 1024 * 1024) {
        await msg.reply("This file is too large!");
        return;
    }

    try {
        const response = await fetch(attachment.url);
        const json = await response.json();
        const sourceName = attachment.name.substr(
            0,
            attachment.name.lastIndexOf(".")
        );

        const result = compress(json);
        await msg.reply({
            content: "Successfully compressed!",
            files: [new MessageAttachment(result, sourceName + ".bin")]
        });
    } catch (err) {
        if (err instanceof SyntaxError) {
            await msg.reply("That doesn't look like a valid JSON file... 🤔");
            return;
        }
        throw err;
    }
}

module.exports = {
    name: "sbe:compress",
    execute
};
