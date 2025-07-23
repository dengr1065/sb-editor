const { MessageAttachment } = require("discord.js");
const {
    trustedRoles,
    shapez2ViewerPath,
    disabledCommands
} = require("../../config.json");
const { spawnSync } = require("child_process");

/**
 * Executes the external Shapez 2 viewer and returns both
 * the image and related errors.
 * @param {string[]} instructions
 * @param {number} shapeSize
 * @returns {{ errors: string, image: Buffer }}
 */
function executeViewer(instructions, shapeSize) {
    const proc = spawnSync("python3", [".", shapeSize.toString()], {
        shell: true,
        cwd: shapez2ViewerPath,
        input: JSON.stringify(instructions)
    });

    const stderr = proc.stderr.toString("utf-8").trim();
    if (proc.status > 0) {
        // Unrecoverable error - no image was generated
        throw new Error("Internal error: " + stderr);
    }

    return {
        errors: stderr,
        image: proc.stdout
    };
}

/**
 * Returns everything that may be a viewer instruction
 * found in the specified string.
 * @param {string} message
 */
function extractInstructions(message) {
    /** @type {string[]} */
    const result = [];
    let currentIndex = 0;

    while (currentIndex >= 0 && currentIndex < message.length) {
        const startIndex = message.indexOf("{", currentIndex);
        if (currentIndex < 0) {
            // There are no more instructions
            break;
        }

        const endIndex = message.indexOf("}", startIndex);
        if (endIndex < 0) {
            // Not a valid instruction, but there may be more
            currentIndex = startIndex + 1;
            continue;
        }

        // Now check for anything that is definitely not an instruction
        let instruction = message.slice(startIndex + 1, endIndex);
        if (instruction.startsWith("`") && instruction.endsWith("`")) {
            // Ignore code formatting
            instruction = instruction.slice(1, instruction.length - 1);
        }

        currentIndex = endIndex + 1;
        if (instruction.includes("\n")) {
            // Definitely not an instruction
            continue;
        }

        result.push(instruction);
    }

    return result;
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    if (msg.content.toLowerCase().startsWith("sbe:s2viewer")) {
        throw new Error("You are not supposed to directly call this command");
    }

    const callerRoles = msg.member.roles.cache;
    if (!callerRoles.some((role) => trustedRoles.includes(role.id))) {
        // Ignore users who cannot use the viewer
        return;
    }

    const instructions = extractInstructions(msg.content).slice(0, 64);
    if (instructions.length == 0) {
        return;
    }

    // regex sux
    let shapeSize = 56;
    if (msg.content.includes("/size:")) {
        shapeSize = parseInt(msg.content.split("/size:")[1], 10) || shapeSize;
    }

    const { errors, image } = executeViewer(instructions, shapeSize);
    let filename = "shapes.png";
    if (msg.content.includes("/spoiler")) {
        filename = "SPOILER_" + filename;
    }

    await msg.channel.send({
        content: errors || undefined,
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

    if (disabledCommands[msg.guildId]?.includes("sbe:s2viewer")) {
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
    name: "sbe:s2viewer",
    execute,
    load: (client) => {
        client.on("messageCreate", watcher);
    }
};
