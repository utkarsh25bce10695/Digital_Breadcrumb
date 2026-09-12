/**
 * Thin promise wrapper around chrome.storage.local.
 * Keeps the storage schema in one place so other files don't
 * need to know the exact key format.
 *
 * Storage schema:
 *   "cookieScan:<domain>" -> {
 *       domain: string,
 *       scannedAt: number (ms epoch),
 *       overallScore: number,
 *       overallClassification: "LOW RISK" | "MEDIUM RISK" | "HIGH RISK",
 *       cookies: [
 *           { name, score, classification, reasons, isTracker, isThirdParty }
 *       ]
 *   }
 *
 *   "scannedDomains" -> string[]   (index of every domain we have a scan for,
 *                                    so the popup can list history without
 *                                    scanning all of chrome.storage.local)
 */

const DOMAIN_INDEX_KEY = "scannedDomains";

function scanKey(domain) {
    return `cookieScan:${domain}`;
}

async function getScan(domain) {
    const key = scanKey(domain);
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
}

async function saveScan(domain, scanResult) {
    const key = scanKey(domain);
    await chrome.storage.local.set({ [key]: scanResult });
    await addToDomainIndex(domain);
    return scanResult;
}

async function addToDomainIndex(domain) {
    const result = await chrome.storage.local.get(DOMAIN_INDEX_KEY);
    const domains = new Set(result[DOMAIN_INDEX_KEY] || []);

    if (!domains.has(domain)) {
        domains.add(domain);
        await chrome.storage.local.set({
            [DOMAIN_INDEX_KEY]: Array.from(domains)
        });
    }
}

async function getScannedDomains() {
    const result = await chrome.storage.local.get(DOMAIN_INDEX_KEY);
    return result[DOMAIN_INDEX_KEY] || [];
}

async function getAllScans() {
    const domains = await getScannedDomains();

    if (domains.length === 0) {
        return [];
    }

    const keys = domains.map(scanKey);
    const result = await chrome.storage.local.get(keys);

    return domains
        .map(domain => result[scanKey(domain)])
        .filter(Boolean);
}

export { getScan, saveScan, getScannedDomains, getAllScans };
