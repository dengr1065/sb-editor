import { ChatInputCommand, Command } from "@sapphire/framework";
import { strict as assert } from "assert";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    escapeMarkdown
} from "discord.js";
import { accentColor, repoURL, version } from "../config.js";

export class InfoCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            description: "Brief information about this server and the bot."
        });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => {
                builder //
                    .setName(this.name)
                    .setDescription(this.description);
            },
            { idHints: ["1063462814376796313"] }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        assert(interaction.guild);

        const guildName = escapeMarkdown(interaction.guild.name);
        const memberCount = interaction.guild.memberCount;
        const startTime = (performance.timeOrigin / 1000).toFixed(0);
        const gatewayPing = interaction.client.ws.ping;

        const info = [
            `**${guildName}** has ${memberCount} members.`,
            `sb-editor was started <t:${startTime}:R>.`,
            `Gateway ping is ${gatewayPing}ms.`
        ];

        const embed = new EmbedBuilder() //
            .setColor(accentColor)
            .setTitle(`sb-editor v${version}`)
            .setDescription(info.join(" "));

        const sourceCodeButton = new ButtonBuilder() //
            .setLabel("Source Code")
            .setStyle(ButtonStyle.Link)
            .setURL(repoURL);

        const linksRow = new ActionRowBuilder<ButtonBuilder>() //
            .addComponents(sourceCodeButton);

        await interaction.reply({
            embeds: [embed],
            components: [linksRow],
            ephemeral: true
        });
    }
}
