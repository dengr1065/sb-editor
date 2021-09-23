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
 * Prepares data to display in embeds.
 * @param {{
 *     game: import("../typings").PuzzleGameData,
 *     meta: import("../typings").PuzzleMetaData
 * }} puzzle
 */
function formatData({ game, meta }) {
    const { w, h } = game.bounds;

    const descriptionPrefix = {
        [undefined]: "A",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard"
    }[difficultyFromValue(meta.difficulty)];

    const time = meta.averageTime
        ? formatPuzzleTime(meta.averageTime)
        : undefined;

    const finishRate = meta.completions / meta.downloads;
    const showRate = !isNaN(finishRate);

    const buildings = { ...buildingToEmoji };
    const excluded = game.excludedBuildings || [];

    for (const building of excluded) {
        delete buildings[building];
    }

    return {
        title: meta.title,
        description: `${descriptionPrefix} puzzle by ${meta.author}`,
        size: `${w}x${h}`,
        downloads: meta.downloads,
        completions: meta.completions,
        averageTime: time,
        completionRate: showRate ? Math.round(finishRate * 100) : undefined,
        buildings: Object.values(buildings).join(" "),
        likes: meta.likes
    };
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const slice = msg.content.startsWith("sbe:puzzle") ? 1 : 0;
    const key = msg.content.split(/\s+/).slice(slice)[0];

    const puzzle = await fetchPuzzle(key);
    if (!puzzle.meta.completed) {
        // Ignore download by the bot
        puzzle.meta.downloads--;
    }

    const data = formatData(puzzle);
    const embed = new MessageEmbed();
    embed.setAuthor(data.description);
    embed.setTitle(`${data.title} (${data.size})`);
    embed.setFooter(
        `${msg.member.displayName} • Key: ${key}`,
        msg.author.displayAvatarURL({ size: 64 })
    );

    // Display allowed buildings and reports (if any)
    const { list: reports } = await puzzleReports(key);
    const reportsLine = reports.length ? `\n${reports.length} report(s)` : "";
    embed.setDescription(data.buildings + reportsLine);

    // Downloads & likes
    const downloads = `${data.downloads} (\\👍 ${data.likes})`;
    embed.addField("Downloads", downloads, true);

    // Completions and rate (if possible to calculate)
    const completions = data.completionRate
        ? `${data.completions} (${data.completionRate}%)`
        : data.completions;
    embed.addField("Completions", completions, true);

    if (data.averageTime) {
        embed.addField("Avg. time", data.averageTime, true);
    }

    /** @type {{[key: string]: import("canvas").Canvas}} */
    const shapesCache = {};
    shapesCache[key] = renderShape(key, 64);

    embed.setThumbnail("attachment://shape.png");
    embed.setImage("attachment://field.png");

    const thumbnail = shapesCache[key].toBuffer("image/png");
    const puzzleField = await renderPuzzle(puzzle.game, shapesCache);

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
