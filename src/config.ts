import Ajv, { JSONSchemaType } from "ajv";
import { Colors } from "discord.js";
import { readFile } from "fs/promises";

interface Config {
    discordToken: string;
    puzzleToken?: string;
    repoDirectory?: string;
    ripgrepBinary?: string;
    gitBinary?: string;
}

const configSchema: JSONSchemaType<Config> = {
    type: "object",
    properties: {
        discordToken: { type: "string" },
        puzzleToken: { type: "string", nullable: true },
        repoDirectory: { type: "string", nullable: true },
        ripgrepBinary: { type: "string", nullable: true },
        gitBinary: { type: "string", nullable: true }
    },
    required: ["discordToken"],
    additionalProperties: false
};

const config = JSON.parse(await readFile("./config.json", "utf-8"));

const ajv = new Ajv.default();
const validateConfig = ajv.compile(configSchema);

if (!validateConfig(config)) {
    const errors = (validateConfig.errors ?? [])
        .map((err) => err.message ?? "")
        .join("\n - ");

    throw new Error(`Invalid configuration file:\n - ${errors}`);
}

const botConfig = config as Config;
export default botConfig;

const version: string = JSON.parse(await readFile("./package.json", "utf-8")).version;
const accentColor = Colors.DarkVividPink;
const repoURL = "https://github.com/dengr1065/sb-editor";
const shapezFileBaseURL =
    "https://github.com/tobspr-games/shapez-community-edition/blob/master/";

export { accentColor, repoURL, shapezFileBaseURL, version };
