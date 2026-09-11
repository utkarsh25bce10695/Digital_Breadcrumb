// ---------------------------------------
// Get website from URL
// ---------------------------------------

const urlParams = new URLSearchParams(
    window.location.search
);

const currentWebsite =
    urlParams.get("website");


// ---------------------------------------
// Get page elements
// ---------------------------------------

const websiteName =
    document.getElementById("websiteName");

const websiteScoreElement =
    document.getElementById("websiteScore");

const scoreStatus =
    document.getElementById("scoreStatus");

const scoreCard =
    document.querySelector(".score-card");

const totalCookiesElement =
    document.getElementById("totalCookies");

const blockedCookiesElement =
    document.getElementById("blockedCookies");

const allowedCookiesElement =
    document.getElementById("allowedCookies");

const cookieCount =
    document.getElementById("cookieCount");

const cookieContainer =
    document.getElementById("cookieContainer");


// ---------------------------------------
// Filter buttons
// ---------------------------------------

const allButton =
    document.getElementById("allButton");

const blockedButton =
    document.getElementById("blockedButton");

const allowedButton =
    document.getElementById("allowedButton");


// ---------------------------------------
// Current dashboard data
// ---------------------------------------

let dashboardData = {
    website:
        currentWebsite || "Unknown Website",

    websiteScore: 100,

    totalCookies: 0,

    blockedCookies: 0,

    allowedCookies: 0,

    cookies: []
};


// ---------------------------------------
// Temporary fallback data
//
// Used only until real background data
// is available from Nilesh's pipeline.
// ---------------------------------------

const fallbackCookies = [
    {
        name: "_ga",
        score: 35,
        category: "Tracking",
        status: "blocked",
        description:
            "Tracking cookie",
        reason:
            "Low privacy score and tracking behavior"
    },
    {
        name: "fbp",
        score: 28,
        category: "Advertising",
        status: "blocked",
        description:
            "Advertising cookie",
        reason:
            "Used for advertising and user tracking"
    },
    {
        name: "session_id",
        score: 92,
        category: "Functional",
        status: "allowed",
        description:
            "Essential session cookie",
        reason:
            "Required for normal website functionality"
    },
    {
        name: "preferences",
        score: 75,
        category: "Functional",
        status: "allowed",
        description:
            "Stores user preferences",
        reason:
            "Used to remember website settings"
    }
];


// ---------------------------------------
// Load dashboard data
// ---------------------------------------

function loadDashboardData() {

    chrome.storage.local.get(
        [
            "cookies",
            "websiteScores"
        ],
        function (data) {

            let storedCookies =
                data.cookies;

            let storedScores =
                data.websiteScores;


            // ---------------------------------------
            // Get cookies for current website
            // ---------------------------------------

            let websiteCookies = [];

            if (
                storedCookies &&
                currentWebsite
            ) {

                if (
                    Array.isArray(
                        storedCookies[currentWebsite]
                    )
                ) {

                    websiteCookies =
                        storedCookies[
                            currentWebsite
                        ];

                }

            }


            // ---------------------------------------
            // Temporary fallback
            // ---------------------------------------

            if (
                !Array.isArray(
                    websiteCookies
                ) ||
                websiteCookies.length === 0
            ) {

                websiteCookies =
                    fallbackCookies;

            }


            // ---------------------------------------
            // Get website score
            // ---------------------------------------

            let websiteScore = 100;

            if (
                storedScores &&
                currentWebsite &&
                storedScores[currentWebsite] !==
                undefined
            ) {

                const scoreData =
                    storedScores[
                        currentWebsite
                    ];

                if (
                    typeof scoreData ===
                    "object"
                ) {

                    websiteScore =
                        Number(
                            scoreData.websiteScore
                        );

                }
                else {

                    websiteScore =
                        Number(
                            scoreData
                        );

                }

            }
            else {

                // Temporary fallback score

                websiteScore = 25;

            }


            // ---------------------------------------
            // Count blocked / allowed
            // ---------------------------------------

            const blockedCount =
                websiteCookies.filter(
                    function (cookie) {

                        return (
                            String(
                                cookie.status
                            ).toLowerCase()
                            === "blocked"
                        );

                    }
                ).length;


            const allowedCount =
                websiteCookies.filter(
                    function (cookie) {

                        return (
                            String(
                                cookie.status
                            ).toLowerCase()
                            === "allowed"
                        );

                    }
                ).length;


            // ---------------------------------------
            // Store dashboard data
            // ---------------------------------------

            dashboardData = {

                website:
                    currentWebsite ||
                    "Unknown Website",

                websiteScore:
                    websiteScore,

                totalCookies:
                    websiteCookies.length,

                blockedCookies:
                    blockedCount,

                allowedCookies:
                    allowedCount,

                cookies:
                    websiteCookies

            };


            // ---------------------------------------
            // Render dashboard
            // ---------------------------------------

            renderDashboard();

        }
    );

}


// ---------------------------------------
// Render dashboard
// ---------------------------------------

function renderDashboard() {

    // Display website

    websiteName.textContent =
        dashboardData.website;


    // Display website score

    websiteScoreElement.textContent =
        dashboardData.websiteScore;


    // Display score status

    updateScoreStatus();


    // Display statistics

    totalCookiesElement.textContent =
        dashboardData.totalCookies;

    blockedCookiesElement.textContent =
        dashboardData.blockedCookies;

    allowedCookiesElement.textContent =
        dashboardData.allowedCookies;


    // Display all cookies initially

    displayCookies("ALL");

}


// ---------------------------------------
// Update score status
// ---------------------------------------

function updateScoreStatus() {

    // Remove old score classes

    scoreCard.classList.remove(
        "excellent",
        "good",
        "moderate",
        "low"
    );


    if (
        dashboardData.websiteScore >= 80
    ) {

        scoreStatus.textContent =
            "Excellent Protection";

        scoreCard.classList.add(
            "excellent"
        );

    }
    else if (
        dashboardData.websiteScore >= 60
    ) {

        scoreStatus.textContent =
            "Good Protection";

        scoreCard.classList.add(
            "good"
        );

    }
    else if (
        dashboardData.websiteScore >= 40
    ) {

        scoreStatus.textContent =
            "Moderate Protection";

        scoreCard.classList.add(
            "moderate"
        );

    }
    else {

        scoreStatus.textContent =
            "Low Protection";

        scoreCard.classList.add(
            "low"
        );

    }

}


// ---------------------------------------
// Display cookies
// ---------------------------------------

function displayCookies(filter) {

    cookieContainer.innerHTML = "";


    let filteredCookies =
        dashboardData.cookies;


    // Apply filters

    if (
        filter === "BLOCKED"
    ) {

        filteredCookies =
            dashboardData.cookies.filter(
                function (cookie) {

                    return (
                        String(
                            cookie.status
                        ).toLowerCase()
                        === "blocked"
                    );

                }
            );

    }


    if (
        filter === "ALLOWED"
    ) {

        filteredCookies =
            dashboardData.cookies.filter(
                function (cookie) {

                    return (
                        String(
                            cookie.status
                        ).toLowerCase()
                        === "allowed"
                    );

                }
            );

    }


    // No cookies at all

    if (
        dashboardData.cookies.length === 0
    ) {

        cookieCount.textContent =
            "0 detected";


        cookieContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No cookies detected
                </h3>

                <p>
                    This website currently has no detectable cookies.
                </p>

            </div>
        `;

        return;

    }


    // Update count

    cookieCount.textContent =
        filteredCookies.length +
        " shown";


    // No matching cookies

    if (
        filteredCookies.length === 0
    ) {

        cookieContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No matching cookies
                </h3>

                <p>
                    There are no cookies in this category.
                </p>

            </div>
        `;

        return;

    }


    // Create cookie cards

    filteredCookies.forEach(
        function (cookie) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "cookie-card";


            // Score styling

            const scoreClass =
                Number(cookie.score) < 50
                    ? "risky"
                    : "safe";


            // Status styling

            const normalizedStatus =
                String(
                    cookie.status
                ).toLowerCase();


            const statusClass =
                normalizedStatus === "blocked"
                    ? "blocked"
                    : "allowed";


            // Description fallback

            const description =
                cookie.description ||
                cookie.category ||
                "Cookie detected";


            // Reason fallback

            let reason =
                cookie.reason;


            // Support Yashi's reasons array

            if (
                !reason &&
                Array.isArray(
                    cookie.reasons
                )
            ) {

                reason =
                    cookie.reasons.join(
                        ", "
                    );

            }


            if (
                !reason
            ) {

                reason =
                    "No additional reason available";

            }


            card.innerHTML = `
                <div class="cookie-top">

                    <strong>
                        ${cookie.name}
                    </strong>

                    <span class="cookie-score ${scoreClass}">

                        ${cookie.score}/100

                    </span>

                </div>


                <p>

                    ${description}

                </p>


                <div class="cookie-info">

                    <span>

                        Category:
                        ${cookie.category || "Unknown"}

                    </span>


                    <span
                        class="status ${statusClass}"
                    >

                        ${normalizedStatus.toUpperCase()}

                    </span>

                </div>


                <div class="reason">

                    ${reason}

                </div>
            `;


            cookieContainer.appendChild(
                card
            );

        }
    );

}


// ---------------------------------------
// Filter button UI
// ---------------------------------------

function setActiveButton(button) {

    allButton.classList.remove(
        "active"
    );

    blockedButton.classList.remove(
        "active"
    );

    allowedButton.classList.remove(
        "active"
    );


    button.classList.add(
        "active"
    );

}


// ---------------------------------------
// Filter events
// ---------------------------------------

allButton.addEventListener(
    "click",
    function () {

        setActiveButton(
            allButton
        );

        displayCookies(
            "ALL"
        );

    }
);


blockedButton.addEventListener(
    "click",
    function () {

        setActiveButton(
            blockedButton
        );

        displayCookies(
            "BLOCKED"
        );

    }
);


allowedButton.addEventListener(
    "click",
    function () {

        setActiveButton(
            allowedButton
        );

        displayCookies(
            "ALLOWED"
        );

    }
);


// ---------------------------------------
// Initial load
// ---------------------------------------

loadDashboardData();
