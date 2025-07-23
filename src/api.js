import { config, VERSION } from "./config.ts";

const urlBase = "https://api.shapez.io/v1/";
let ratelimitRemaining = 120;
let ratelimitReset = Date.now();

export async function request(endpoint, options = {}) {
    if (ratelimitRemaining == 0 && Date.now() < ratelimitReset) {
        throw new Error("The bot is rate-limited.");
    }

    const response = await fetch(urlBase + endpoint, {
        ...options,
        headers: {
            "user-agent": "ShapeBotEditor/" + VERSION,
            "x-api-key": "d5c54aaa491f200709afff082c153ef2",
            "x-token": config.apiToken,
            ...(options.body ? { "content-type": "application/json" } : {}),
            ...(options.headers || {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (response.headers.has("ratelimit-reset")) {
        const remaining = Number(response.headers.get("ratelimit-remaining"));
        const resetMills =
            Number(response.headers.get("ratelimit-reset")) * 1000;

        ratelimitRemaining = remaining;
        ratelimitReset = Date.now() + resetMills;
    }

    const json = await response.json();

    // Please don't do that in your back-ends!
    if (json.error) {
        throw new Error(json.error);
    }

    return json;
}
