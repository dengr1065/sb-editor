import { createCanvas, Image, loadImage } from "@napi-rs/canvas";
import { readFileSync } from "fs";
import { request } from "./api.js";
import { fromShortKey } from "./viewer/shape.js";
import { renderShape } from "./viewer/viewer.js";

const imageSizeLimit = 560;
const initialTileSize = 64;
const puzzleBorderColor = "#17c0ff";

const sprites = {
    grid: makeGrid(48),
    emitter: loadImage(readFileSync("./assets/constant_producer.png")),
    goal: loadImage(readFileSync("./assets/goal_acceptor.png")),
    block: loadImage(readFileSync("./assets/block.png")),
    blue: loadImage(readFileSync("./assets/blue.png")),
    cyan: loadImage(readFileSync("./assets/cyan.png")),
    green: loadImage(readFileSync("./assets/green.png")),
    purple: loadImage(readFileSync("./assets/purple.png")),
    red: loadImage(readFileSync("./assets/red.png")),
    uncolored: loadImage(readFileSync("./assets/uncolored.png")),
    white: loadImage(readFileSync("./assets/white.png")),
    yellow: loadImage(readFileSync("./assets/yellow.png"))
};

function makeGrid(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#42434b";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#3e3f47";
    ctx.fillRect(0, 0, (size / 20) * 19, (size / 20) * 19);

    return canvas;
}

/**
 * @param {import("./typings").PuzzleGameData} game
 * @param {{ [key: string]: import("@napi-rs/canvas").Canvas }} shapes
 */
export async function renderPuzzle(game, shapes) {
    let tile = initialTileSize;
    const { w, h } = game.bounds;
    let imgWidth = w * tile;
    let imgHeight = h * tile;

    // Limit max width/height of the image
    const imgMaxSize = Math.max(imgWidth, imgHeight);
    if (imgMaxSize > imageSizeLimit) {
        tile = Math.floor(imageSizeLimit / Math.max(w, h));
        imgWidth = w * tile;
        imgHeight = h * tile;
    }

    // Append border/shadow dimensions
    const shadow = Math.round(tile / 2);
    const border = Math.round(tile / 20);
    imgWidth += (shadow + border) * 2;
    imgHeight += (shadow + border) * 2;

    const field = createCanvas(imgWidth, imgHeight);
    const ctx = field.getContext("2d");

    ctx.save();
    ctx.shadowBlur = (shadow / 4) * 3;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = tile / 6;

    ctx.fillStyle = puzzleBorderColor;
    ctx.fillRect(shadow, shadow, imgWidth - shadow * 2, imgHeight - shadow * 2);
    ctx.restore();

    ctx.translate(shadow + border, shadow + border);

    // Fill the canvas with grid pattern (slow)
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            ctx.drawImage(sprites.grid, x * tile, y * tile, tile, tile);
        }
    }

    // Load all shapes before drawing
    for (const building of game.buildings) {
        try {
            if (building.item && !shapes[building.item]) {
                shapes[building.item] = renderShape(building.item, tile);
            }
        } catch {
            /* it's a color (hopefully) */
        }
    }

    ctx.translate(Math.ceil(w / 2) * tile, Math.ceil(h / 2) * tile);

    for (const building of game.buildings) {
        const sprite = await sprites[building.type];
        const buildingSize = tile + (1 / 8) * tile;
        const buildingOffset = -buildingSize / 2;

        const renderX = (building.pos.x + 0.5) * tile + buildingOffset;
        const renderY = (building.pos.y + 0.5) * tile + buildingOffset;

        if (building.type == "block") {
            ctx.drawImage(sprite, renderX, renderY, buildingSize, buildingSize);
            continue;
        }

        const centerX = renderX - buildingOffset;
        const centerY = renderY - buildingOffset;
        const rotation = (Math.PI / 180) * building.pos.r;

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.drawImage(
            sprite,
            buildingOffset,
            buildingOffset,
            buildingSize,
            buildingSize
        );

        // Offsets for item rendering
        ctx.translate(0, (tile / 32) * (building.type == "goal" ? -1.7 : 1));

        const itemSprite =
            (await sprites[building.item]) || shapes[building.item];
        const itemSize =
            itemSprite instanceof Image ? tile * 0.35 : tile * 0.65;
        ctx.rotate(-rotation);
        ctx.drawImage(
            itemSprite,
            -itemSize / 2,
            -itemSize / 2,
            itemSize,
            itemSize
        );

        ctx.restore();
    }

    return field.toBuffer("image/png");
}

/**
 * @param {number} time
 */
export function formatPuzzleTime(time) {
    let seconds = Math.round(time % 60);
    let minutes = Math.floor(time / 60);

    return `${minutes ? `${minutes}m ` : ""}${seconds}s`;
}

export function difficultyFromValue(difficulty) {
    if (difficulty === null) {
        return undefined;
    }

    if (difficulty < 0.2) {
        return "easy";
    }

    return difficulty <= 0.6 ? "medium" : "hard";
}

export async function fetchPuzzle(key) {
    fromShortKey(key); // Throws if the key is not valid

    /** @type {import("./typings").PuzzleData} */
    const puzzle = await request("puzzles/download/" + encodeURIComponent(key));
    return puzzle;
}

/**
 * Search the puzzle collection with specified options.
 * @param {{ searchTerm: string, difficulty: string, duration: string }} options
 */
export async function searchPuzzles(options) {
    options.includeCompleted = true;

    /** @type {import("./typings").PuzzleMetaData[]} */
    const results = await request("puzzles/search", {
        method: "POST",
        body: options
    });
    return results;
}
