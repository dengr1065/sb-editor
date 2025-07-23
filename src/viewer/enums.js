/** @enum {string} */
export const enumSubShape = {
    rect: "rect",
    circle: "circle",
    star: "star",
    windmill: "windmill"
};

/** @enum {string} */
export const enumSubShapeToShortcode = {
    [enumSubShape.rect]: "R",
    [enumSubShape.circle]: "C",
    [enumSubShape.star]: "S",
    [enumSubShape.windmill]: "W"
};

/** @enum {enumSubShape} */
export const enumShortcodeToSubShape = {};
for (const key in enumSubShapeToShortcode) {
    enumShortcodeToSubShape[enumSubShapeToShortcode[key]] = key;
}

export const arrayQuadrantIndexToOffset = [
    { x: 1, y: -1 }, // tr
    { x: 1, y: 1 }, // br
    { x: -1, y: 1 }, // bl
    { x: -1, y: -1 } // tl
];

/** @enum {string} */
export const enumColors = {
    red: "red",
    green: "green",
    blue: "blue",

    yellow: "yellow",
    purple: "purple",
    cyan: "cyan",

    white: "white",
    uncolored: "uncolored"
};

/** @enum {string} */
export const enumColorToShortcode = {
    [enumColors.red]: "r",
    [enumColors.green]: "g",
    [enumColors.blue]: "b",

    [enumColors.yellow]: "y",
    [enumColors.purple]: "p",
    [enumColors.cyan]: "c",

    [enumColors.white]: "w",
    [enumColors.uncolored]: "u"
};

/** @enum {string} */
export const enumColorsToHexCode = {
    [enumColors.red]: "#ff666a",
    [enumColors.green]: "#78ff66",
    [enumColors.blue]: "#66a7ff",

    // red + green
    [enumColors.yellow]: "#fcf52a",

    // red + blue
    [enumColors.purple]: "#dd66ff",

    // blue + green
    [enumColors.cyan]: "#87fff5",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.uncolored]: "#aaaaaa"
};

/** @enum {enumColors} */
export const enumShortcodeToColor = {};
for (const key in enumColorToShortcode) {
    enumShortcodeToColor[enumColorToShortcode[key]] = key;
}

/** @enum {string} */
export const enumLevelsToShape = {
    1: "CuCuCuCu",
    2: "----CuCu",
    3: "RuRuRuRu",
    4: "RuRu----",
    5: "Cu----Cu",
    6: "Cu------",
    7: "CrCrCrCr",
    8: "RbRb----",
    9: "CpCpCpCp",
    10: "ScScScSc",
    11: "CgScScCg",
    12: "CbCbCbRb:CwCwCwCw",
    13: "RpRpRpRp:CwCwCwCw",
    14: "--Cg----:--Cr----",
    15: "SrSrSrSr:CyCyCyCy",
    16: "SrSrSrSr:CyCyCyCy:SwSwSwSw",
    17: "CbRbRbCb:CwCwCwCw:WbWbWbWb",
    18: "Sg----Sg:CgCgCgCg:--CyCy--",
    19: "CpRpCp--:SwSwSwSw",
    20: "RuCw--Cw:----Ru--",
    21: "CrCwCrCw:CwCrCwCr:CrCwCrCw:CwCrCwCr",
    22: "Cg----Cr:Cw----Cw:Sy------:Cy----Cy",
    23: "CcSyCcSy:SyCcSyCc:CcSyCcSy",
    24: "CcRcCcRc:RwCwRwCw:Sr--Sw--:CyCyCyCy",
    25: "Rg--Rg--:CwRwCwRw:--Rg--Rg",
    26: "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw"
};
