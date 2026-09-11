import { scoreWebsite } from "../scoring/websiteScorer.js";

// ---------------------------------------
// Get popup elements
// ---------------------------------------

const detailsButton = document.getElementById("detailsButton");
const settingsButton = document.getElementById("settingsButton");

const currentWebsite = document.getElementById("currentWebsite");
const websiteScoreElement = document.getElementById("websiteScore");

const totalCookiesElement =
    document.getElementById("totalCookies");

const blockedCookiesElement =
    document.getElementById("blockedCookies");

const allowedCookiesElement =
    document.getElementById("allowedCookies");

const detectedCookiesElement =
    document.getElementById("detectedCookies");

const scoreStatusElement =
    document.getElementById("scoreStatus");


// ---------------------------------------
// TEMPORARY TEST DATA
//
// Later this will be replaced by real
// cookies detected by Nilesh's module.
// ---------------------------------------

const testCookies = [
    {
        name: "session_id",
        isTracker: false,
        isThirdParty: false,
        expirationDays: 1,
        secure: true,
        httpOnly: true
    },
    {
        name: "analytics_id",
        isTracker: true,
        isThirdParty: true,
        expirationDays: 730,
        secure: false,
        httpOnly: false
    },
    {
        name: "advertising_cookie",
        isTracker: true,
        isThirdParty: true,
        expirationDays: 90,
        secure: true,
        httpOnly: false
    },
    {
        name: "preferences",
        isTracker: false,
        isThirdParty: false,
        expirationDays: 30,
        secure: true,
        httpOnly: true
    }
];


// ---------------------------------------
// Get current website
// ---------------------------------------

chrome.tabs.query(
    {
        active: true,
        currentWindow: true
    },
    function (tabs) {

        const currentTab = tabs[0];

        let website = "Unknown Website";

        try {

            const url = new URL(currentTab.url);
            website = url.hostname;

        }
        catch (error) {

            website = "Extension Page";

        }


        // Display website name

        currentWebsite.textContent = website;


        // ---------------------------------------
        // Run Yashi's scoring system
        // ---------------------------------------

        const result = scoreWebsite(
            website,
            testCookies
        );


        console.log(
            "PrivacyGuard Scoring Result:",
            result
        );


        // ---------------------------------------
        // Update Website Score
        // ---------------------------------------

        websiteScoreElement.textContent =
            result.websiteScore;


        // ---------------------------------------
        // Update Total Cookies
        // ---------------------------------------

        totalCookiesElement.textContent =
            result.totalCookies;

        detectedCookiesElement.textContent =
            result.totalCookies + " detected";


        // ---------------------------------------
        // Load blocking threshold
        //
        // Final shared storage structure:
        // settings.blockingThreshold
        // ---------------------------------------

        chrome.storage.local.get(
            ["settings"],
            function (data) {

                const threshold =
                    data.settings &&
                    data.settings.blockingThreshold !== undefined
                        ? Number(
                            data.settings.blockingThreshold
                        )
                        : 40;


                let blockedCount = 0;
                let allowedCount = 0;


                // ---------------------------------------
                // Calculate Blocked / Allowed
                // ---------------------------------------

                result.cookies.forEach(
                    function (cookie) {

                        if (
                            cookie.score < threshold
                        ) {

                            blockedCount++;

                        }
                        else {

                            allowedCount++;

                        }

                    }
                );


                // ---------------------------------------
                // Update UI
                // ---------------------------------------

                blockedCookiesElement.textContent =
                    blockedCount;

                allowedCookiesElement.textContent =
                    allowedCount;

            }
        );


        // ---------------------------------------
        // Update Privacy Status
        // ---------------------------------------

        if (
            result.websiteScore >= 70
        ) {

            scoreStatusElement.textContent =
                "Good Protection";

        }
        else if (
            result.websiteScore >= 40
        ) {

            scoreStatusElement.textContent =
                "Moderate Privacy Risk";

        }
        else {

            scoreStatusElement.textContent =
                "High Privacy Risk";

        }

    }
);


// ---------------------------------------
// Open Dashboard
// ---------------------------------------

detailsButton.addEventListener(
    "click",
    function () {

        chrome.tabs.query(
            {
                active: true,
                currentWindow: true
            },
            function (tabs) {

                const currentTab =
                    tabs[0];

                let website =
                    "Unknown Website";


                try {

                    const url =
                        new URL(
                            currentTab.url
                        );

                    website =
                        url.hostname;

                }
                catch (error) {

                    website =
                        "Extension Page";

                }


                chrome.tabs.create({

                    url:

                        chrome.runtime.getURL(
                            "popup/dashboard/dashboard.html"
                        )

                        +

                        "?website="

                        +

                        encodeURIComponent(
                            website
                        )

                });

            }
        );

    }
);


// ---------------------------------------
// Open Settings
// ---------------------------------------

settingsButton.addEventListener(
    "click",
    function () {

        chrome.tabs.create({

            url:

                chrome.runtime.getURL(
                    "popup/options/options.html"
                )

        });

    }
);
