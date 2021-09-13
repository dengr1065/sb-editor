const { fromShortKey, toShortKey } = require("./viewer/shape");

const modifiers = {
    rot: doRot,
    rot_ccw: doRotCcw,
    cut: doCut,
    struct: doStruct,
    fill: doFill,
    layers: doLayers
};

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

    const dstLeft = [];
    const dstRight = [];
    for (const layer of shape) {
        const left = [null, null, layer[2], layer[3]];
        const right = [layer[0], layer[1], null, null];

        if (left[2] || left[3]) {
            dstLeft.push(left);
        }
        if (right[0] || right[1]) {
            dstRight.push(right);
        }
    }

    return [toShortKey(dstLeft), toShortKey(dstRight)];
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
    const srcLayers = input.split(":");
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
            if (flags.length > 0) {
                result.push(...handleInstruction(instruction, [...flags]));
            } else {
                result.push(instruction);
            }
        }

        return result;
    } catch (err) {
        console.log(err);
        return [];
    }
}

module.exports = { handleInstruction };
