import { ChatInputCommand, Command } from "@sapphire/framework";
import { strict as assert } from "assert";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    codeBlock,
    ComponentType,
    inlineCode,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    time,
    TimestampStyles
} from "discord.js";
import path from "path";
import botConfig, { shapezFileBaseURL } from "../config.js";
import { executeCommand, getSurroundingLines } from "../util.js";

type SourceMatch = {
    file: string;
    line: number;
    extension: string;
};

type BlameResult = {
    summary: string;
    date: Date;
};

const fieldSeparator = "//";
const commonFlags = [
    "--only-matching",
    "-r",
    "",
    "--field-match-separator",
    fieldSeparator,
    "--line-number",
    "--smart-case"
];

const sourceTypes = ["js", "ts", "sass"];
for (const sourceType of sourceTypes) {
    commonFlags.push("--type", sourceType);
}

function getBlame(gitBinary: string, repoDir: string, match: SourceMatch): BlameResult {
    const args = ["blame", "-p", "-L"];
    args.push(`${match.line},${match.line}`);
    args.push(match.file);

    const result = executeCommand(gitBinary, args, repoDir).split("\n");

    const summary = result //
        .find((line) => line.startsWith("summary "))
        ?.slice(8);
    const timestamp = result //
        .find((line) => line.startsWith("committer-time "))
        ?.slice(15);

    return {
        summary: summary ?? "Error",
        date: new Date(Number(timestamp) * 1000)
    };
}

function getMatches(pattern: string, rgBinary: string, repoDir: string): SourceMatch[] {
    const sourceDir = path.join(repoDir, "src");
    const args = [...commonFlags, sourceDir, "-e", pattern];

    return executeCommand(rgBinary, args) //
        .split("\n")
        .filter((line) => Boolean(line))
        .map((line) => {
            const [filePath, lineNumStr] = line.split(fieldSeparator);

            return {
                file: path.relative(repoDir, filePath),
                line: Number(lineNumStr),
                extension: path.extname(filePath).slice(1)
            };
        });
}

export class SourceCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: "Quick search for a pattern in shapez source code."
        });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder //
                    .setName(this.name)
                    .setDescription(this.description)
                    .addStringOption((builder) =>
                        builder //
                            .setName("pattern")
                            .setDescription(
                                "Substring or regular expression to search for."
                            )
                            .setRequired(true)
                    );
            },
            { idHints: ["1066896793733972029"] }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { repoDirectory, ripgrepBinary, gitBinary } = botConfig;

        assert(repoDirectory, "shapez repository directory is not configured!");
        assert(ripgrepBinary, "ripgrep binary path is not configured!");
        assert(gitBinary, "git binary path is not configured!");

        await interaction.deferReply();

        const pattern = interaction.options.getString("pattern", true);
        let matches: SourceMatch[] = [];

        try {
            matches = getMatches(pattern, ripgrepBinary, repoDirectory);
        } catch {
            // Nothing found :(
            // Need to handle this better
        }

        const selectMenuOptions = matches //
            .slice(0, 25)
            .map((match) =>
                new StringSelectMenuOptionBuilder() //
                    .setLabel(`${match.file}, L${match.line}`)
                    .setValue(matches.indexOf(match).toString())
            );

        const selectComponent = new StringSelectMenuBuilder() //
            .setCustomId("match")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(selectMenuOptions);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>() //
            .setComponents(selectComponent);

        const message = await interaction.editReply({
            content: `Source code search: Found ${matches.length} matches.`,
            components: matches.length > 0 ? [selectRow] : []
        });

        // Now that we've sent the list of matches, wait for the user to choose one!

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (comInteraction) => comInteraction.user.id === interaction.user.id,
            time: 30e3,
            max: 1
        });

        collector.on("collect", async (comInteraction) => {
            assert(comInteraction.isStringSelectMenu());
            await comInteraction.deferUpdate();

            const match = matches[Number(comInteraction.values[0])];
            const filePath = path.join(repoDirectory, match.file);
            const range = await getSurroundingLines(filePath, match.line, 6, 5);

            const blame = getBlame(gitBinary, repoDirectory, match);
            let content = `${blame.summary} - ${time(
                blame.date,
                TimestampStyles.RelativeTime
            )}`;

            content += `\nShowing ${inlineCode(match.file)},`;
            content += ` lines ${range.start}-${range.end}:`;
            content += `\n${codeBlock(match.extension, range.content)}`;

            const repoLink = new ButtonBuilder() //
                .setLabel("View on GitHub")
                .setStyle(ButtonStyle.Link)
                .setURL(
                    shapezFileBaseURL + match.file + `#L${range.start}-L${range.end}`
                );

            const buttonRow = new ActionRowBuilder<ButtonBuilder>() //
                .setComponents(repoLink);

            await interaction.editReply({
                content,
                components: [buttonRow]
            });
        });

        collector.on("ignore", async (comInteraction) => {
            await comInteraction.reply({
                ephemeral: true,
                content: "This command was started by another user!"
            });
        });
    }
}
