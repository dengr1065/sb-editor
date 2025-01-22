const { createCanvas } = require("@napi-rs/canvas");
const { MessageAttachment, Permissions } = require("discord.js");
const {
    trustedRoles,
    disabledCommands,
    viewerChannelAllowlist
} = require("../../config.json");
const { handleInstruction } = require("../instruction_viewer");
const { renderShape } = require("../viewer/viewer");
const { enumLevelsToShape } = require("../viewer/enums");

/**
 * Extracts shape definitions and modifiers from messages.
 * @param {string} message
 */
function extractShapes(message) {
    const parts = message.split("{").slice(1);
    const shapes = [];
    if (parts.length == 0) {
        // No shapes can be found, return immediately
        return shapes;
    }

    for (const part of parts) {
        let startIndex = 0;
        let endIndex = part.indexOf("}");
        if (endIndex == -1) {
            continue;
        }

        if (part[0] == "`" && part[endIndex - 1] == "`") {
            startIndex = 1;
            endIndex -= 1;
        }

        const instruction = part.slice(startIndex, endIndex);
        if (instruction.includes("\n")) {
            continue;
        }

        const flags = instruction.split("+");
        let shortKey = flags.shift();

        if (shortKey.startsWith("level")) {
            const levelString = shortKey.substring(5);
            try {
                const level = Number(levelString);
                shortKey = enumLevelsToShape[level];
            } catch (error) {
                continue;
            }
        }

        if (flags.length > 10) {
            throw new Error("Limit of modifiers reached");
        }

        shapes.push(...handleInstruction(shortKey, flags));
    }

    return shapes;
}

/**
 * Renders all provided shapes to a canvas, and exports
 * it to a PNG buffer.
 * @param {string[]} shapes
 * @param {number} shapeSize
 */
function renderShapes(shapes, shapeSize = 56) {
    const columnsCount = Math.min(shapes.length, 8);
    const rowsCount = Math.ceil(shapes.length / columnsCount);

    const imageWidth = shapeSize * columnsCount;
    const imageHeight = shapeSize * rowsCount;

    const canvas = createCanvas(imageWidth, imageHeight);
    const ctx = canvas.getContext("2d");

    for (const index in shapes) {
        const shapeImage = renderShape(shapes[index], shapeSize);

        const x = (index % columnsCount) * shapeSize;
        const y = Math.floor(index / columnsCount) * shapeSize;
        ctx.drawImage(shapeImage, x, y);
    }

    const buffer = canvas.toBuffer("image/png");
    return buffer;
}

/**
 * Checks if the message is allowed to trigger the instruction viewer.
 * @param {import("discord.js").Message} msg
 */
function isViewerAllowed(msg) {
    const member = msg.member;

    // Users who can manage messages can always trigger the viewer
    if (member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
        return true;
    }

    // Roles can be explicitly allowed to use instruction viewer
    const callerRoles = msg.member.roles.cache;
    for (const [, role] of callerRoles) {
        if (trustedRoles.includes(role.id)) {
            return true;
        }
    }

    // Check per-server allowlisted channels, where the viewer can be
    // used by anyone.
    const guildChannelAllowlist = viewerChannelAllowlist[msg.guildId];
    if (!Array.isArray(guildChannelAllowlist)) {
        // No configuration for this server, anyone can use the viewer
        return true;
    }

    return guildChannelAllowlist.includes(msg.channelId);
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    if (msg.content.toLowerCase().startsWith("sbe:viewer")) {
        throw new Error("You are not supposed to directly call this command");
    }

    if (!isViewerAllowed(msg)) {
        return false;
    }

    const shapes = extractShapes(msg.content).slice(0, 64);
    if (shapes.length == 0) {
        return;
    }

    // regex sux
    let shapeSize = 56;
    if (msg.content.includes("/size:")) {
        shapeSize = parseInt(msg.content.split("/size:")[1], 10) || shapeSize;
        shapeSize = Math.max(16, Math.min(192, shapeSize));
    }

    const image = renderShapes(shapes, shapeSize);
    let filename = `shapes.png`;
    if (msg.content.endsWith("/spoiler")) {
        filename = "SPOILER_" + filename;
    }

    await msg.channel.send({
        files: [new MessageAttachment(image, filename)]
    });
}

/**
 * Checks for messages possibly containing instructions.
 * @param {import("discord.js").Message} msg
 */
async function watcher(msg) {
    if (msg.author.bot) return;
    if (!msg.content.includes("{")) return;

    if (disabledCommands[msg.guildId]?.includes("sbe:viewer")) {
        return;
    }

    try {
        await execute(msg);
    } catch (err) {
        console.log(err);
        /* ignore errors in non-interactive mode */
    }
}

module.exports = {
    name: "sbe:viewer",
    execute,
    load: (client) => {
        client.on("messageCreate", watcher);
    },
    unload: (client) => {
        client.off("messageCreate", watcher);
    }
};
