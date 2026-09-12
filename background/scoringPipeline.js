import { adaptCookie } from "../scoring/cookieAdapter.js";
import { scoreCookie } from "../scoring/cookieScorer.js";
import { saveScan } from "./storage.js";

let trackerDataCache = null;

/**
 * Loads data/trackers.json once and caches it in memory for the
 * lifetime of the service worker.
 */
async function loadTrackerData() {
    if (trackerDataCache) {
        return trackerDataCache;
    }

    const url = chrome.runtime.getURL("data/trackers.json");
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to load trackers.json: ${response.status}`
        );
    }

    trackerDataCache = await response.json();
    return trackerDataCache;
}

/**
 * Extracts a bare domain (no protocol, no path) from a full URL,
 * e.g. "https://www.example.com/path" -> "www.example.com"
 */
function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return "";
    }
}

/**
 * Runs the full detector -> scorer -> storage pipeline for one tab/site.
 *
 * @param {string} tabUrl - the URL of the tab being scanned
 * @returns {Promise<object|null>} the saved scan result, or null if the
 *   URL had no usable domain (e.g. chrome:// pages)
 */
async function scanAndScoreSite(tabUrl) {
    const websiteDomain = extractDomain(tabUrl);

    if (!websiteDomain) {
        return null;
    }

    // --- Detector step (Nilesh): pull raw cookies for this site ---
    const rawCookies = await chrome.cookies.getAll({ domain: websiteDomain });

    const trackerData = await loadTrackerData();

    // --- Adapter + scorer step (Yashi): normalize, then score ---
    const scoredCookies = rawCookies.map(rawCookie => {
        const adapted = adaptCookie(rawCookie, websiteDomain, trackerData);
        const result = scoreCookie(adapted);

        return {
            name: adapted.name,
            isTracker: adapted.isTracker,
            isThirdParty: adapted.isThirdParty,
            score: result.score,
            classification: result.classification,
            reasons: result.reasons
        };
    });

    const scanResult = buildScanResult(websiteDomain, scoredCookies);

    // --- Storage step ---
    await saveScan(websiteDomain, scanResult);

    return scanResult;
}

/**
 * Aggregates individual cookie scores into one site-level result.
 * Overall score is the average of individual cookie scores (100 if
 * the site has no cookies at all).
 */
function buildScanResult(domain, scoredCookies) {
    const overallScore = scoredCookies.length
        ? Math.round(
              scoredCookies.reduce((sum, c) => sum + c.score, 0) /
                  scoredCookies.length
          )
        : 100;

    let overallClassification;
    if (overallScore < 40) {
        overallClassification = "HIGH RISK";
    } else if (overallScore < 70) {
        overallClassification = "MEDIUM RISK";
    } else {
        overallClassification = "LOW RISK";
    }

    return {
        domain,
        scannedAt: Date.now(),
        overallScore,
        overallClassification,
        cookies: scoredCookies
    };
}

export { scanAndScoreSite };
