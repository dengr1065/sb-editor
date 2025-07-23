import config from "../config.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };

const VERSION = packageJson.version;

export { config, VERSION };
