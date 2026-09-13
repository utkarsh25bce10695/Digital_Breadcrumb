import { scanAndScoreSite } from "./scoringPipeline.js";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") {
        return;
    }

    if (!tab.url || !/^https?:\/\//.test(tab.url)) {
        return;
    }

    scanAndScoreSite(tab.url).catch(err => {
        console.error("PrivacyGuard: scan failed for", tab.url, err);
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "RESCAN_TAB") {
        return false;
    }

    (async () => {
        try {
            const [activeTab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

            if (!activeTab?.url) {
                sendResponse({ ok: false, error: "No active tab URL" });
                return;
            }

            const result = await scanAndScoreSite(activeTab.url);
            sendResponse({ ok: true, result });
        } catch (err) {
            sendResponse({ ok: false, error: String(err) });
        }
    })();

    return true;
});
