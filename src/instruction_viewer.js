const { fromShortKey, toShortKey, filterQuads } = require("./viewer/shape");

const modifiers = {
    rot: doRot,
    rot_ccw: doRotCcw,
    cut: doCut,
    qcut: doQCut,
    struct: doStruct,
    fill: doFill,
    layers: doLayers
};

const fillRegex = /[A-Z](?![a-z])/g;

/**
 * @param {string} input
 */
function doRot(input) {
    const shape = fromShortKey(input);
    for (const layer of shape) {
        // Rotate 90deg
        layer.unshift(layer.pop());
    }

    return [toShortKey(shape)];
}

/**
 * @param {string} input
 */
function doRotCcw(input) {
    const shape = fromShortKey(input);
    for (const layer of shape) {
        // Rotate 90deg
        layer.push(layer.shift());
    }

    return [toShortKey(shape)];
}

/**
 * @param {string} input
 */
function doCut(input) {
    const shape = fromShortKey(input);

    const result = [filterQuads(shape, [2, 3]), filterQuads(shape, [0, 1])];
    return result.filter((shape) => shape != null).map(toShortKey);
}

/**
 * @param {string} input
 */
function doQCut(input) {
    const shape = fromShortKey(input);

    const result = [
        filterQuads(shape, [0]),
        filterQuads(shape, [1]),
        filterQuads(shape, [2]),
        filterQuads(shape, [3])
    ];
    return result.filter((shape) => shape != null).map(toShortKey);
}

/**
 * @param {string} input
 */
function doStruct(input) {
    const colors = ["r", "g", "b", "w"];
    const layers = input.split(":");
    const resultLayers = [];

    for (const layer in layers) {
        const color = colors[layer];
        let newLayer = "";

        for (const quad of layers[layer]) {
            if (!["0", "1"].includes(quad)) {
                throw new Error("Invalid structure format");
            }

            newLayer += quad == "1" ? "C" + color : "--";
        }

        resultLayers.push(newLayer);
    }

    return [resultLayers.join(":")];
}

/**
 * @param {string} input
 */
function doFill(input) {
    const srcLayers = input
        .split(":")
        .map((l) => l.replace(fillRegex, "$&u").replace(/-u/g, "--"));
    const dstLayers = [];

    for (const layer of srcLayers) {
        const times = 8 / layer.length;
        if (![1, 2, 4].includes(times)) {
            throw new Error("Invalid fill pattern");
        }

        dstLayers.push(layer.repeat(times));
    }

    return [dstLayers.join(":")];
}

/**
 * @param {string} input
 */
function doLayers(input) {
    return input.split(":");
}

/**
 * Transforms instructions into lists of shapes.
 * @param {string} instruction
 * @param {string[]} flags
 */
function handleInstruction(shortKey, flags) {
    try {
        if (flags.length == 0) {
            return [shortKey];
        }

        const modifier = flags.shift();
        const result = [];
        for (const instruction of modifiers[modifier](shortKey)) {
            result.push(...handleInstruction(instruction, [...flags]));
        }

        return result;
    } catch (err) {
        console.log(err);
        return [];
    }
}

module.exports = { handleInstruction };
