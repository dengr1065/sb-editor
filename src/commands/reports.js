import { MessageEmbed } from "discord.js";
import { puzzleReports, userReports } from "../reports.js";
import { fromShortKey } from "../viewer/shape.js";

function formatPuzzlesArray(array) {
    const lines = array.slice(0, 4).map((line) => `\`${line}\``);
    if (array.length > 4) {
        lines.push(`${array.length - 4} more puzzle(s)...`);
    }

    if (lines.length == 0) {
        lines.push("No reports.");
    }
    return lines.join("\n");
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const target = msg.content.split(/\s+/).slice(1).join(" ");
    let stats = await userReports(target);
    let title = `Reports by ${target}`;
    let noReportsTitle = "This user hasn't reported any puzzles yet.";

    const embed = new MessageEmbed();

    try {
        // Puzzle mode
        fromShortKey(target);
        stats = await puzzleReports(target);
        title = `Reports for \`${target}\``;
        noReportsTitle =
            "This puzzle doesn't exist or wasn't reported by anyone yet.";

        embed.addField("Trolling", stats.trolling.length.toString(), true);
        embed.addField(
            "Not solvable",
            stats.unsolvable.length.toString(),
            true
        );
        embed.addField("Profane", stats.profane.length.toString(), true);
    } catch {
        // Fallback to user mode
        const trolling = stats.trolling.map((report) => report.shortKey);
        const unsolvable = stats.unsolvable.map((report) => report.shortKey);
        const profane = stats.profane.map((report) => report.shortKey);

        embed.addField("Trolling", formatPuzzlesArray(trolling));
        embed.addField("Not solvable", formatPuzzlesArray(unsolvable));
        embed.addField("Profane", formatPuzzlesArray(profane));
    }

    if (stats.list.length == 0) {
        await msg.reply(noReportsTitle);
        return;
    }

    embed.setTitle(title);
    embed.setDescription(`Total reports: ${stats.list.length}`);

    await msg.reply({
        embeds: [embed]
    });
}

export default {
    name: "sbe:reports",
    execute
};
