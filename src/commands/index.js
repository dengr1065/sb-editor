import antispam from "./antispam.js";
import compress from "./compress.js";
import decompress from "./decompress.js";
import mods from "./mods.js";
import puzzle from "./puzzle.js";
import puzzlesearch from "./puzzlesearch.js";
import reports from "./reports.js";
import unlock from "./unlock.js";
import upvotepin from "./upvotepin.js";
import viewer from "./viewer.js";

/**
 * @typedef {Object} Command
 * @property {string} name
 * @property {(msg: import("discord.js").Message) => Promise<void>} execute
 * @property {function} [load]
 */

/** @type {Command[]} */
const commands = [
    antispam,
    compress,
    decompress,
    mods,
    puzzle,
    puzzlesearch,
    reports,
    unlock,
    upvotepin,
    viewer
];

export default commands;
