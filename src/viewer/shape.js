const {
    enumShortcodeToSubShape,
    enumShortcodeToColor,
    enumSubShapeToShortcode,
    enumColorToShortcode
} = require("./enums");

const maxLayer = 4;

const possibleShapesString = Object.keys(enumShortcodeToSubShape).join("");
const possibleColorsString = Object.keys(enumShortcodeToColor).join("");
const layerRegex = new RegExp(
    "([" + possibleShapesString + "][" + possibleColorsString + "]|-{2}){4}"
);

/**
 * Generates the definition from the given short key
 * @returns {{ subShape: string, color: string }[][]}
 */
function fromShortKey(key) {
    const sourceLayers = key.split(":");
    if (sourceLayers.length > maxLayer) {
        throw new Error("excess layers");
    }

    const layers = [];
    for (let i = 0; i < sourceLayers.length; ++i) {
        const text = sourceLayers[i];
        if (text.length !== 8) {
            throw new Error(text + "is not filled");
        }

        if (text === "--".repeat(4)) {
            throw new Error("empty layer " + (i + 1));
        }

        const quads = [null, null, null, null];
        for (let quad = 0; quad < 4; ++quad) {
            const shapeText = text[quad * 2 + 0];
            const subShape = enumShortcodeToSubShape[shapeText];
            const colorText = text[quad * 2 + 1];
            const color = enumShortcodeToColor[colorText];

            if (subShape) {
                if (!color) {
                    throw new Error("invalid color " + colorText);
                }

                quads[quad] = { subShape, color };
            } else if (shapeText !== "-") {
                throw new Error("invalid shape " + shapeText);
            }
        }

        layers.push(quads);
    }

    return layers;
}

/**
 * Serializes the shape definition back to a string
 * @param {{ subShape: string, color: string }[][]} shape
 */
function toShortKey(shape) {
    let key = "";
    for (let layerIndex = 0; layerIndex < shape.length; ++layerIndex) {
        const layer = shape[layerIndex];

        for (let quadrant = 0; quadrant < layer.length; ++quadrant) {
            const item = layer[quadrant];
            if (item) {
                key +=
                    enumSubShapeToShortcode[item.subShape] +
                    enumColorToShortcode[item.color];
            } else {
                key += "--";
            }
        }

        if (layerIndex < shape.length - 1) {
            key += ":";
        }
    }

    return key;
}

function filterQuads(shape, indexes) {
    const newShape = [];
    for (const layer of shape) {
        const newLayer = [null, null, null, null];
        for (let i = 0; i < layer.length; i++) {
            if (indexes.includes(i)) {
                newLayer[i] = layer[i];
            }
        }

        if (newLayer.some((quad) => !!quad)) {
            newShape.push(newLayer);
        }
    }

    if (newShape.length == 0) {
        return undefined;
    }
    return newShape;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomShape() {
    const shapes = Object.values(enumSubShapeToShortcode);
    shapes.push("-");
    return shapes[getRandomInt(shapes.length)];
}

function getRandomColor() {
    return Object.values(enumColorToShortcode)[
        getRandomInt(Object.keys(enumColorToShortcode).length)
    ];
}

function randomShape() {
    let layers = getRandomInt(maxLayer);
    let code = "";

    for (var i = 0; i <= layers; i++) {
        let layertext = "";
        for (let y = 0; y <= 3; y++) {
            let randomShape = getRandomShape();
            let randomColor = getRandomColor();

            if (randomShape === "-") {
                randomColor = "-";
                console.log("in");
            }
            layertext += randomShape + randomColor;
        }

        // empty layer not allowed
        if (layertext === "--------") {
            i--;
        } else {
            code += layertext + ":";
        }
    }

    code = code.replace(/:+$/, "");
    return fromShortKey(code);
}

module.exports = {
    fromShortKey,
    toShortKey,
    filterQuads,
    randomShape,
    layerRegex
};
