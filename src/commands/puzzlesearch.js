const { MessageEmbed } = require("discord.js");
const {
    searchPuzzles,
    difficultyFromValue,
    formatPuzzleTime
} = require("../puzzles");

const difficulties = ["any", "easy", "medium", "hard"];
const durations = ["any", "short", "medium", "long"];

function modifierError(modifier, choices) {
    const choicesCombined = choices.map((c) => `\`${c}\``).join(", ");
    const message = "must be one of " + choicesCombined + ".";
    return new Error(`Invalid \`${modifier}\` modifier: ${message}`);
}

/**
 * Transforms a textual query into search options.
 * @param {string} query
 */
function parseQuery(query) {
    const options = {
        difficulty: "any",
        duration: "any"
    };

    const words = [""]; // Little IntelliSense hack

    for (const word of query.split(/\s+/)) {
        if (word.startsWith("diff:")) {
            options.difficulty = word.slice(5);
            continue;
        }

        if (word.startsWith("time:")) {
            options.duration = word.slice(5);
            continue;
        }

        // Pass this word through
        words.push(word);
    }

    if (!difficulties.includes(options.difficulty)) {
        throw modifierError("diff:", difficulties);
    }

    if (!durations.includes(options.duration)) {
        throw modifierError("time:", durations);
    }

    return {
        ...options,
        searchTerm: words.join(" ").trim()
    };
}

function makeFooter({ difficulty, duration }) {
    const modifiers = [];

    if (difficulty != "any") {
        modifiers.push(`Difficulty: ${difficulty}`);
    }

    if (duration != "any") {
        modifiers.push(`Duration: ${duration}`);
    }

    if (modifiers.length > 0) {
        // Prepend " • "
        modifiers.unshift("");
    }

    return modifiers.join(" • ");
}

/**
 * Formats puzzle metadata for the embed.
 * @param {import("../typings").PuzzleMetaData} meta
 */
function formatMeta(meta) {
    const { title, author, shortKey } = meta;
    const { completions, downloads, likes, averageTime: time } = meta;
    const rate = Math.round((completions / downloads) * 100);
    const difficulty = difficultyFromValue(meta.difficulty);

    const diffText = difficulty ? ` [${difficulty[0].toUpperCase()}]` : "";
    const compText = `${completions}/${downloads}`;
    const rateText = isNaN(rate) ? "" : ` (\\✔️ ${rate}%)`;
    const timeText = time ? `, \\⏲️ ${formatPuzzleTime(time)}` : "";

    const likesText = likes > 0 ? ` | \\👍 ${likes}` : "";

    return {
        title: `${title}${diffText} • ${compText}${rateText}${timeText}`,
        value: `by ${author}${likesText} • \`${shortKey}\``
    };
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const query = msg.content.split(/\s+/).slice(1).join(" ");
    const options = parseQuery(query);

    const results = await searchPuzzles(options);
    let description = `API returned ${results.length} puzzle(s).`;

    if (results.length > 5) {
        description += " Showing only 5 of them.";
    }

    const embed = new MessageEmbed();
    embed.setTitle("Search results");
    embed.setDescription(description);
    embed.setFooter({
        text: msg.member.displayName + makeFooter(options),
        iconURL: msg.author.displayAvatarURL({ size: 64 })
    });

    for (const result of results.slice(0, 5)) {
        const { title, value } = formatMeta(result);
        embed.addField(title, value);
    }

    await msg.reply({
        embeds: [embed]
    });
}

module.exports = {
    name: "sbe:puzzlesearch",
    execute
};
