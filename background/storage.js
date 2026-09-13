/**
 * Reads/writes the SAME chrome.storage.local schema that
 * frontend/popup/dashboard/dashboard.js and popup.js already expect:
 *
 *   "cookies" -> {
 *       "<website>": [
 *           {
 *               name: string,
 *               score: number,
 *               category: "Tracking" | "Advertising" | "Functional",
 *               status: "blocked" | "allowed",
 *               description: string,
 *               reason: string
 *           },
 *           ...
 *       ]
 *   }
 *
 *   "websiteScores" -> {
 *       "<website>": number   // overall website score, 0-100
 *   }
 *
 *   "settings" -> { blockingThreshold: number }   // already read by popup.js,
 *                                                   we only ever read this,
 *                                                   never write it here.
 */

async function getBlockingThreshold() {
    const data = await chrome.storage.local.get(["settings"]);
    const threshold =
        data.settings && data.settings.blockingThreshold !== undefined
            ? Number(data.settings.blockingThreshold)
            : 40;
    return threshold;
}

/**
 * Merges this website's cookie records and score into the shared
 * "cookies" / "websiteScores" objects without clobbering other sites'
 * entries already stored there.
 */
async function saveWebsiteScan(website, websiteScore, cookieRecords) {
    const data = await chrome.storage.local.get([
        "cookies",
        "websiteScores"
    ]);

    const allCookies = data.cookies || {};
    const allScores = data.websiteScores || {};

    allCookies[website] = cookieRecords;
    allScores[website] = websiteScore;

    await chrome.storage.local.set({
        cookies: allCookies,
        websiteScores: allScores
    });
}

export { getBlockingThreshold, saveWebsiteScan };
