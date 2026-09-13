import { adaptCookie } from "../scoring/cookieAdapter.js";
import { scoreWebsite } from "../scoring/websiteScorer.js";
import { getBlockingThreshold, saveWebsiteScan } from "./storage.js";

let trackerDataCache = null;

async function loadTrackerData() {
    if (trackerDataCache) {
        return trackerDataCache;
    }

    const url = chrome.runtime.getURL("data/trackers.json");
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load trackers.json: ${response.status}`);
    }

    trackerDataCache = await response.json();
    return trackerDataCache;
}

function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return "";
    }
}

/**
 * Maps an adapted cookie's tracker/third-party flags to the category
 * label dashboard.js expects. This is our own convention (not defined
 * anywhere in the scorer), so adjust here if Nilesh/Yashi want a
 * different taxonomy.
 */
function categorize(adaptedCookie) {
    if (adaptedCookie.isTracker) {
        return "Tracking";
    }
    if (adaptedCookie.isThirdParty) {
        return "Advertising";
    }
    return "Functional";
}

/**
 * Full pipeline: raw cookies (detector) -> adaptCookie -> scoreWebsite
 * (scorer) -> shaped records -> chrome.storage (in the schema
 * dashboard.js/popup.js already read).
 */
async function scanAndScoreSite(tabUrl) {
    const website = extractDomain(tabUrl);

    if (!website) {
        return null;
    }

    const rawCookies = await chrome.cookies.getAll({ domain: website });
    const trackerData = await loadTrackerData();

    const adaptedCookies = rawCookies.map(rawCookie =>
        adaptCookie(rawCookie, website, trackerData)
    );

    const result = scoreWebsite(website, adaptedCookies);
    const threshold = await getBlockingThreshold();

    // scoreWebsite's cookies array doesn't carry isTracker/isThirdParty
    // through, so zip it back up against adaptedCookies (same order,
    // same length) to build the category field.
    const cookieRecords = result.cookies.map((scored, i) => {
        const adapted = adaptedCookies[i];
        const status = scored.score < threshold ? "blocked" : "allowed";

        return {
            name: scored.name,
            score: scored.score,
            category: categorize(adapted),
            status,
            description: `${categorize(adapted)} cookie`,
            reason: scored.reasons.join(", ")
        };
    });

    await saveWebsiteScan(website, result.websiteScore, cookieRecords);

    return { website, websiteScore: result.websiteScore, cookies: cookieRecords };
}

export { scanAndScoreSite };
