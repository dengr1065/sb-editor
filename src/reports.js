/**
 * @typedef {object} PuzzleReport
 * @property {string} shortKey
 * @property {"trolling" | "unsolvable" | "profane"} reason
 * @property {string} reporterName
 * @property {Date} createdAt
 */

/**
 * @type {PuzzleReport[]}
 */
const reportsCache = [];
const url = "https://api.shapez.io/v1/noauth/reports";

let lastUpdated = 0;

async function fetchReports() {
    if (Date.now() < lastUpdated + 5 * 60e3) {
        return;
    }

    const response = await fetch(url);
    const reports = await response.json();

    for (const report of reports) {
        report.createdAt = new Date(report.createdAt);
    }

    reportsCache.splice(0);
    reportsCache.push(...reports);
    lastUpdated = Date.now();
}

/**
 * @param {PuzzleReport[]} reports
 * @returns {{
 *     trolling: PuzzleReport[],
 *     unsolvable: PuzzleReport[],
 *     profane: PuzzleReport[]
 * }}
 */
function categorize(reports) {
    const result = {
        trolling: [],
        unsolvable: [],
        profane: []
    };

    for (const report of reports) {
        result[report.reason].push(report);
    }

    const sortFunc = (a, b) => b.createdAt.getTime() - a.createdAt.getTime();

    result.trolling.sort(sortFunc);
    result.unsolvable.sort(sortFunc);
    result.profane.sort(sortFunc);
    return result;
}

async function userReports(username) {
    await fetchReports();
    const result = reportsCache.filter((r) => r.reporterName == username);

    return {
        ...categorize(result),
        list: result.map((r) => r.shortKey)
    };
}

async function puzzleReports(shortKey) {
    await fetchReports();
    const result = reportsCache.filter((r) => r.shortKey == shortKey);

    return {
        ...categorize(result),
        list: result.map((r) => r.reporterName)
    };
}

module.exports = { userReports, puzzleReports };
