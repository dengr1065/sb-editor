const { MessageEmbed, MessageAttachment } = require("discord.js");
const { layerRegex } = require("../viewer/shape");
const { puzzleWatchlist } = require("../../config.json");
const { renderShape } = require("../viewer/viewer");
const { puzzleReports } = require("../reports");
const {
    fetchPuzzle,
    renderPuzzle,
    difficultyFromValue,
    formatPuzzleTime
} = require("../puzzles");

const buildingToEmoji = {
    belt: "864892674540830722",
    balancer: "864892613143035983",
    underground_belt: "864893607110508544",
    cutter: "864892914583863367",
    rotater: "864893413883510814",
    stacker: "864893461551644702",
    mixer: "864893281971863572",
    painter: "864893330046976022",
    trash: "864893572343922719"
};

for (const building in buildingToEmoji) {
    // Turn IDs into valid emoji
    const emojiId = buildingToEmoji[building];
    buildingToEmoji[building] = `<:icon_${building}:${emojiId}>`;
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const slice = msg.content.startsWith("sbe:puzzle") ? 1 : 0;
    const key = msg.content.split(/\s+/).slice(slice)[0];

    const { game, meta } = await fetchPuzzle(key);

    const { list: reports } = await puzzleReports(key);
    const reportsLine = reports.length ? `\n${reports.length} report(s)` : "";

    if (!meta.completed) {
        meta.downloads--;
    }

    const buildings = { ...buildingToEmoji };
    const excludedBuildings = game.excludedBuildings;

    if (excludedBuildings != undefined) {
        for (const building of excludedBuildings) {
            delete buildings[building];
        }
    }

    const bounds = `${game.bounds.w}x${game.bounds.h}`;
    const downloads = `${meta.downloads} (\\👍 ${meta.likes})`;

    const difficultyId = difficultyFromValue(meta.difficulty);
    const difficulty = difficultyId
        ? `${difficultyId[0].toUpperCase()}${difficultyId.split(1)}`
        : "A";

    const completionRate = Math.round(
        (meta.completions / meta.downloads) * 100
    );
    const completions = isNaN(completionRate)
        ? meta.completions
        : `${meta.completions} (${completionRate}%)`;

    const embed = new MessageEmbed();
    embed.setAuthor(`${difficulty} puzzle by ${meta.author}`);
    embed.setTitle(`${meta.title} (${bounds})`);
    embed.setDescription(Object.values(buildings).join(" ") + reportsLine);
    embed.setFooter(
        `${msg.member.displayName} • Key: ${key}`,
        msg.author.displayAvatarURL({ size: 64 })
    );

    embed.addField("Downloads", downloads, true);
    embed.addField("Completions", completions, true);
    if (meta.averageTime) {
        embed.addField("Avg. time", formatPuzzleTime(meta.averageTime), true);
    }

    /** @type {{[key: string]: import("canvas").Canvas}} */
    const shapesCache = {};
    shapesCache[key] = renderShape(key, 64);

    const thumbnail = shapesCache[key].toBuffer("image/png");
    embed.setThumbnail("attachment://shape.png");

    const puzzleField = await renderPuzzle(game, shapesCache);
    embed.setImage("attachment://field.png");

    await msg.channel.send({
        embeds: [embed],
        files: [
            new MessageAttachment(thumbnail, "shape.png"),
            new MessageAttachment(puzzleField, "field.png")
        ]
    });

    if (msg.deletable) {
        await msg.delete();
    }
}

/**
 * Checks for messages consisting of shape codes.
 * @param {import("discord.js").Message} msg
 */
async function watcher(msg) {
    if (msg.author.bot) return;
    const isWatched = puzzleWatchlist.includes(msg.channel.id);
    const isThread = msg.channel.type == "GUILD_PUBLIC_THREAD";

    if (!isWatched && !isThread) return;
    if (!layerRegex.test(msg.content)) return;
    if (msg.content.includes(" ")) return;

    try {
        await execute(msg);
    } catch {
        /* ignore errors in non-interactive mode */
    }
}

module.exports = {
    name: "sbe:puzzle",
    execute,
    load: (client) => {
        client.on("messageCreate", watcher);
    },
    unload: (client) => {
        client.off("messageCreate", watcher);
    }
};
