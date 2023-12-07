const { createCanvas } = require("@napi-rs/canvas");
const {
    arrayQuadrantIndexToOffset,
    enumColorsToHexCode,
    enumSubShape
} = require("./enums");
const { fromShortKey } = require("./shape");

const quadrantSize = 10;
const quadrantHalfSize = quadrantSize / 2;

/**
 * @param {import("@napi-rs/canvas").SKRSContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} r
 */
function beginCircle(ctx, x, y, r) {
    if (r < 0.05) {
        ctx.beginPath();
        ctx.rect(x, y, 1, 1);
        return;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2.0 * Math.PI);
}

function radians(degrees) {
    return (degrees * Math.PI) / 180.0;
}

/**
 * @param {import("@napi-rs/canvas").SKRSContext2D} ctx
 * @param {string} message
 */
function renderWarning(ctx, message) {
    const font = "400 16px monospace";

    ctx.font = font;
    const charWidth = ctx.measureText("w").width;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const wSize = Math.ceil(Math.sqrt(message.length));
    const warning = createCanvas(
        (wSize + 1) * charWidth,
        (wSize + 1) * charWidth * 1.2
    );
    const wCtx = warning.getContext("2d");

    wCtx.font = font;
    wCtx.textAlign = "center";
    wCtx.textBaseline = "top";
    wCtx.fillStyle = "white";

    while (message.length > 0) {
        const length = Math.min(wSize, message.length);
        const line = message.slice(0, length);
        message = message.slice(length);

        wCtx.fillText(line.trim(), warning.width / 2, 0);
        wCtx.translate(0, charWidth * 1.2);
    }

    ctx.drawImage(warning, 0, 0, width, height);
}

/**
 * @param {string} code
 * @param {number} s
 */
function renderShape(code, s) {
    const canvas = createCanvas(s, s);
    const context = canvas.getContext("2d");
    let layers;

    try {
        layers = fromShortKey(code);
    } catch (err) {
        // Most likely, this can be simplified, but
        // who cares if it works
        renderWarning(context, err.message);
        return canvas;
    }

    context.translate(s / 2, s / 2);
    context.scale(s / 28, s / 28);

    context.fillStyle = "rgba(40, 50, 65, 0.1)";
    beginCircle(context, 0, 0, quadrantSize * 1.15);
    context.fill();

    for (let layerIndex = 0; layerIndex < layers.length; ++layerIndex) {
        const quadrants = layers[layerIndex];

        const layerScale = Math.max(0.1, 0.9 - layerIndex * 0.22);

        for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
            if (!quadrants[quadrantIndex]) {
                continue;
            }
            const { subShape, color } = quadrants[quadrantIndex];

            const quadrantPos = arrayQuadrantIndexToOffset[quadrantIndex];
            const centerQuadrantX = quadrantPos.x * quadrantHalfSize;
            const centerQuadrantY = quadrantPos.y * quadrantHalfSize;

            const rotation = radians(quadrantIndex * 90);

            context.translate(centerQuadrantX, centerQuadrantY);
            context.rotate(rotation);

            context.fillStyle = enumColorsToHexCode[color];
            context.strokeStyle = "#555";
            context.lineWidth = 1;

            const insetPadding = 0.0;

            switch (subShape) {
                case enumSubShape.rect: {
                    context.beginPath();
                    const dims = quadrantSize * layerScale;
                    context.rect(
                        insetPadding + -quadrantHalfSize,
                        -insetPadding + quadrantHalfSize - dims,
                        dims,
                        dims
                    );

                    break;
                }
                case enumSubShape.star: {
                    context.beginPath();
                    const dims = quadrantSize * layerScale;

                    let originX = insetPadding - quadrantHalfSize;
                    let originY = -insetPadding + quadrantHalfSize - dims;

                    const moveInwards = dims * 0.4;
                    context.moveTo(originX, originY + moveInwards);
                    context.lineTo(originX + dims, originY);
                    context.lineTo(
                        originX + dims - moveInwards,
                        originY + dims
                    );
                    context.lineTo(originX, originY + dims);
                    context.closePath();
                    break;
                }

                case enumSubShape.windmill: {
                    context.beginPath();
                    const dims = quadrantSize * layerScale;

                    let originX = insetPadding - quadrantHalfSize;
                    let originY = -insetPadding + quadrantHalfSize - dims;
                    const moveInwards = dims * 0.4;
                    context.moveTo(originX, originY + moveInwards);
                    context.lineTo(originX + dims, originY);
                    context.lineTo(originX + dims, originY + dims);
                    context.lineTo(originX, originY + dims);
                    context.closePath();
                    break;
                }

                case enumSubShape.circle: {
                    context.beginPath();
                    context.moveTo(
                        insetPadding + -quadrantHalfSize,
                        -insetPadding + quadrantHalfSize
                    );
                    context.arc(
                        insetPadding + -quadrantHalfSize,
                        -insetPadding + quadrantHalfSize,
                        quadrantSize * layerScale,
                        -Math.PI * 0.5,
                        0
                    );
                    context.closePath();
                    break;
                }

                default: {
                    throw new Error("Unkown sub shape: " + subShape);
                }
            }

            context.fill();
            context.stroke();

            context.rotate(-rotation);
            context.translate(-centerQuadrantX, -centerQuadrantY);
        }
    }

    return canvas;
}

module.exports = { renderShape };
