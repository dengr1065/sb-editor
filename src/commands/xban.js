/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const moderatorUser = msg.author;
    const targetUser = await (await msg.fetchReference()).author.fetch();
    const reason = msg.content.split(/\s+/).slice(1).join(" ");

    if (!reason) {
        throw new Error("Missing ban reason.");
    }

    const allGuilds = msg.client.guilds.cache;
    let failedGuilds = 0;

    for (const [, guild] of allGuilds) {
        const botGuildMember = await guild.members.fetch(msg.client.user.id);
        const moderator = await guild.members
            .fetch(moderatorUser.id)
            .catch(() => null);

        if (moderator === null) {
            failedGuilds++;
            continue;
        }

        const canBan = botGuildMember.permissions.has("BAN_MEMBERS", true);
        if (!canBan || !moderator.permissions.has("BAN_MEMBERS", true)) {
            failedGuilds++;
            continue;
        }

        try {
            await guild.members.ban(targetUser.id, { reason });
        } catch {
            failedGuilds++;
        }
    }

    if (failedGuilds == allGuilds.size()) {
        // Couldn't ban in any of the servers
        throw new Error('Missing "Ban Members" permission.');
    }

    const username = `\`${targetUser.username}\``;
    const banCount = allGuilds.size() - failedGuilds;

    await msg.reply(`Banned ${username} in ${banCount} servers.`);
}

module.exports = {
    name: "sbe:xban",
    execute
};
