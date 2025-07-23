/**
 * @typedef {Object} Command
 * @property {string} name
 * @property {(msg: import("discord.js").Message) => Promise<void>} execute
 * @property {function} [load]
 */

/** @type {Command[]} */
const commands = [
    require("./antispam"),
    require("./compress"),
    require("./decompress"),
    require("./mods"),
    require("./puzzle"),
    require("./puzzlesearch"),
    require("./reports"),
    require("./s2viewer"),
    require("./unlock"),
    require("./upvotepin"),
    require("./viewer")
];

module.exports = commands;
