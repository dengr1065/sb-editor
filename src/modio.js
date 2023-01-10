const axios = require("axios").default;

const api = axios.create({
    baseURL: "https://api.mod.io/v1/games/@shapez",
    responseType: "json",
    headers: {
        // mod.io devs are retarded
        "X-Modio-Origin": "web"
    },
    transitional: {
        silentJSONParsing: false
    }
});

/**
 * Searches for a single mod and returns all data.
 * @param {string?} query
 */
async function getRawMod(query = undefined) {
    const response = await api.get("/mods", {
        params: { _limit: 25, _q: query }
    });

    if (response.data.error) {
        throw new Error("Error from mod.io: " + response.data.error);
    }

    response.data.data.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const search = query.toLowerCase();

        // Sort exact matches to be first
        return nameB.includes(search) - nameA.includes(search);
    });

    return response.data.data[0];
}

class Mod {
    constructor(data) {
        this.raw = data;
    }

    /** @returns {string} */
    get id() {
        return this.raw.name_id;
    }

    /** @returns {string} */
    get name() {
        return this.raw.name;
    }

    /** @returns {string} */
    get summary() {
        return this.raw.summary;
    }

    /** @returns {{ name: string, avatarURL: string }} */
    get submitter() {
        return {
            name: this.raw.submitted_by.username,
            avatarURL: this.raw.submitted_by.avatar?.thumb_50x50
        };
    }

    /** @returns {string} */
    get url() {
        return this.raw.profile_url;
    }

    /** @returns {string} */
    get websiteURL() {
        return this.raw.homepage_url;
    }

    /** @returns {Date} */
    get releaseDate() {
        return new Date(this.raw.date_live);
    }

    /** @returns {Date} */
    get updateDate() {
        return new Date(this.raw.date_updated);
    }

    /** @returns {string?} */
    get thumbnailURL() {
        return this.raw.logo.thumb_320x180;
    }

    /** @returns {string[]} */
    get images() {
        return this.raw.media.images.map((file) => {
            return file.thumb_320x180.replace("320x180", "640x360");
        });
    }

    /** @returns {string} */
    get currentVersion() {
        return this.raw.modfile.version;
    }

    get installURL() {
        return (
            "shapeziomm://shapez-mod.entibo.workers.dev/info/" +
            encodeURIComponent(this.raw.name_id)
        );
    }

    /** @returns {string} */
    get downloadURL() {
        return this.raw.modfile.download.binary_url;
    }

    /** @returns {string[]} */
    get tags() {
        return this.raw.tags.map((tag) => tag.name);
    }

    /** @returns {number?} */
    get downloads() {
        return this.raw.stats.downloads_total;
    }
}

/**
 * Searches for a mod and returns wrapped instance.
 * @param {string} query
 */
async function getMod(query) {
    const raw = await getRawMod(query);
    if (raw === undefined) {
        return;
    }

    return new Mod(raw);
}

module.exports = { getMod };
