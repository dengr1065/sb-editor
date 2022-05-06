const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { getMod } = require("../modio");

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const innerCommand = msg.content.split(/\s+/);
    innerCommand.shift();

    const query = innerCommand.join(" ");
    const mod = await getMod(query);

    if (mod === undefined) {
        await msg.reply({
            content: "Nothing found.",
            allowedMentions: {
                repliedUser: false
            }
        });
        return;
    }

    const embed = new MessageEmbed();

    embed.setColor(0x152cc2);
    embed.setTitle(mod.name);
    embed.setURL(mod.url);
    embed.setDescription(mod.summary);
    embed.setThumbnail(mod.thumbnailURL);
    embed.setFooter({
        text: "Submitted by " + mod.submitter.name,
        iconURL: mod.submitter.avatarURL
    });

    embed.addField("Tags", mod.tags.join(", "));
    embed.addField("Version", mod.currentVersion, true);
    embed.addField(
        "Downloads",
        `${mod.downloads.total} (${mod.downloads.today} today)`,
        true
    );
    embed.addField("Updated", `<t:${mod.updateDate.getTime()}:R>`, true);

    if (mod.images.length > 0) {
        embed.setImage(mod.images[0]);
    }

    const actions = new MessageActionRow();
    if (mod.websiteURL) {
        actions.addComponents(
            new MessageButton({
                style: "LINK",
                url: mod.websiteURL,
                label: "Website"
            })
        );
    }

    actions.addComponents(
        new MessageButton({
            style: "LINK",
            url: mod.downloadURL,
            label: `Download v${mod.currentVersion}`
        })
    );

    await msg.reply({
        embeds: [embed],
        components: [actions],
        allowedMentions: {
            repliedUser: false
        }
    });
}

module.exports = {
    name: "sbe:mods",
    execute
};
