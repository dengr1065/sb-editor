const { MessageAttachment } = require("discord.js");
const { default: fetch } = require("node-fetch");
const { decompress } = require("../bin_file");

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    if (msg.attachments.size == 0) {
        await msg.reply("Please attach .bin file to decompress!");
        return;
    }

    const attachment = msg.attachments.first();
    if (attachment.size > 8 * 1024 * 1024) {
        await msg.reply("This file is too large!");
        return;
    }

    const response = await fetch(attachment.url);
    const buffer = await response.buffer();
    const sourceName = attachment.name.substr(
        0,
        attachment.name.lastIndexOf(".")
    );

    const result = decompress(buffer);
    let content = result.data
        ? "Successfully decompressed!"
        : "Failed to decompress!";

    if (result.warnings.length > 0) {
        content += "\n\nWarnings:";
        for (const warn of result.warnings) {
            content += `\n⏵ ${warn}`;
        }
    }

    if (!result.data) {
        await msg.reply(content);
        return;
    }

    const dstBuffer = Buffer.from(
        JSON.stringify(result.data, undefined, 2),
        "utf-8"
    );

    if (dstBuffer.byteLength > 8192 * 1024) {
        await msg.reply("Sorry, the resulting file is too large.");
        return;
    }

    await msg.reply({
        content,
        files: [new MessageAttachment(dstBuffer, sourceName + ".json")]
    });
}

module.exports = {
    name: "sbe:decompress",
    execute
};
