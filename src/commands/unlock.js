const rewards = [
    {
        title: "Cutting Shapes",
        level: 1,
        unlocks: ["cutter", "trash"]
    },
    {
        title: "Rotating",
        level: 4,
        unlocks: ["rotator"]
    },
    {
        title: "Painting",
        level: 6,
        unlocks: ["painter"]
    },
    {
        title: "Color Mixing",
        level: 8,
        unlocks: ["color_mixer"]
    },
    {
        title: "Stacker",
        level: 10,
        unlocks: ["stacker"]
    },
    {
        title: "Balancer",
        level: 3,
        unlocks: ["balancer"]
    },
    {
        title: "Tunnel",
        level: 5,
        unlocks: ["tunnel"]
    },
    {
        title: "CCW Rotating",
        level: 7,
        unlocks: ["rotator_ccw"]
    },
    {
        title: "Rotator (180°)",
        level: 18,
        unlocks: ["rotator_180"]
    },
    {
        title: "Chaining Extractor",
        level: 11,
        unlocks: ["miner_chainable"]
    },
    {
        title: "Tunnel Tier II",
        level: 13,
        unlocks: ["tunnel_tier2"]
    },
    {
        title: "Belt Reader",
        level: 14,
        unlocks: ["belt_reader"]
    },
    {
        title: "Compact Splitter",
        level: 19,
        unlocks: ["splitter"]
    },
    {
        title: "Quad Cutter",
        level: 16,
        unlocks: ["cutter_quad"]
    },
    {
        title: "Double Painting",
        level: 17,
        unlocks: ["painter_double"]
    },
    {
        title: "Storage",
        level: 15,
        unlocks: ["storage"]
    },
    {
        title: "Compact Merger",
        level: 9,
        unlocks: ["merger"]
    },
    {
        title: "Wires & Quad Painter",
        level: 20,
        unlocks: ["button", "painter_quad", "wire_crossing", "wire"]
    },
    {
        title: "Display",
        level: 23,
        unlocks: ["display"]
    },
    {
        title: "Constant Signal",
        level: 22,
        unlocks: ["constant_signal"]
    },
    {
        title: "Logic Gates",
        level: 24,
        unlocks: ["logic_gates", "transistor"]
    },
    {
        title: "Virtual Processing",
        level: 25,
        unlocks: ["virtual_processors", "comparator", "shape_analyzer"]
    },
    {
        title: "Item Filter",
        level: 21,
        unlocks: ["filter"]
    },
    {
        title: "Blueprints",
        level: 12,
        unlocks: ["blueprints"]
    }
];

/**
 * Finds the reward based on provided keywords. All keywords must belong to the
 * same unlock.
 * @param {string[]} keywords
 */
function findReward(keywords) {
    // Guess what unlock was requested
    const allUnlocks = rewards.flatMap((reward) => reward.unlocks);
    const normalizedKeywords = keywords.map((k) => k.toLowerCase());
    const unlock = allUnlocks.find((u) =>
        normalizedKeywords.every((k) => u.includes(k))
    );

    // Now find the reward itself
    for (const reward of rewards) {
        if (reward.unlocks.includes(unlock)) {
            return [reward, unlock];
        }
    }

    return null;
}

/**
 * @param {import("discord.js").Message} msg
 */
async function execute(msg) {
    const keywords = msg.cleanContent
        .slice(module.exports.name.length)
        .trim()
        .split(/\s+/g);
    const result = findReward(keywords);

    if (result === null) {
        await msg.reply({
            content: "No matching unlockables found.",
            allowedMentions: {
                repliedUser: false
            }
        });
        return;
    }

    // unlockId does not always match name/id in shapez!
    const [reward, unlockId] = result;
    const message = `\`${unlockId}\` is available after completing level ${reward.level} ("${reward.title}").`;
    await msg.reply(message);
}

module.exports = {
    name: "sbe:unlock",
    execute
};
