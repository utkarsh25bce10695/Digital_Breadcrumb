// ---------------------------------------
// Get page elements
// ---------------------------------------

const threshold = document.getElementById("threshold");

const thresholdValue = document.getElementById("thresholdValue");

const websiteInput = document.getElementById("websiteInput");

const addWebsite = document.getElementById("addWebsite");

const websiteList = document.getElementById("websiteList");

const saveButton = document.getElementById("saveButton");

const saveMessage = document.getElementById("saveMessage");


// ---------------------------------------
// Website overrides
// ---------------------------------------

let websites = [];


// ---------------------------------------
// Load saved settings
// ---------------------------------------

chrome.storage.local.get(
    ["settings", "siteOverrides"],
    function (data) {

        // Default threshold
        let savedThreshold = 40;


        // Load blocking threshold
        if (
            data.settings &&
            data.settings.blockingThreshold !== undefined
        ) {

            savedThreshold =
                Number(
                    data.settings.blockingThreshold
                );
        }


        // Update slider
        threshold.value =
            savedThreshold;

        thresholdValue.textContent =
            savedThreshold;


        // Load always-allowed websites
        if (
            Array.isArray(
                data.siteOverrides
            )
        ) {

            websites =
                data.siteOverrides;

        }
        else {

            websites = [];

        }


        displayWebsites();

    }
);


// ---------------------------------------
// Threshold slider
// ---------------------------------------

threshold.addEventListener(
    "input",
    function () {

        thresholdValue.textContent =
            threshold.value;

    }
);


// ---------------------------------------
// Add website
// ---------------------------------------

addWebsite.addEventListener(
    "click",
    function () {

        const website =
            websiteInput.value
                .trim()
                .toLowerCase();


        // Empty website
        if (website === "") {

            return;

        }


        // Remove http:// or https://
        const cleanWebsite =
            website
                .replace(/^https?:\/\//, "")
                .replace(/\/.*$/, "");


        // Prevent duplicates
        if (
            websites.includes(
                cleanWebsite
            )
        ) {

            websiteInput.value = "";

            return;

        }


        // Add website
        websites.push(
            cleanWebsite
        );


        // Clear input
        websiteInput.value = "";


        // Refresh list
        displayWebsites();

    }
);


// ---------------------------------------
// Display websites
// ---------------------------------------

function displayWebsites() {

    websiteList.innerHTML = "";


    // No websites added
    if (websites.length === 0) {

        const item =
            document.createElement("li");

        item.textContent =
            "No websites added yet.";

        item.style.color =
            "#777";

        item.style.fontSize =
            "13px";

        websiteList.appendChild(
            item
        );

        return;

    }


    // Display each website
    websites.forEach(
        function (
            website,
            index
        ) {

            const item =
                document.createElement("li");

            item.className =
                "website-item";


            // Website name
            const websiteName =
                document.createElement(
                    "span"
                );

            websiteName.textContent =
                website;


            // Remove button
            const removeButton =
                document.createElement(
                    "button"
                );

            removeButton.textContent =
                "Remove";


            removeButton.addEventListener(
                "click",
                function () {

                    websites.splice(
                        index,
                        1
                    );

                    displayWebsites();

                }
            );


            item.appendChild(
                websiteName
            );

            item.appendChild(
                removeButton
            );

            websiteList.appendChild(
                item
            );

        }
    );

}


// ---------------------------------------
// Save settings
// ---------------------------------------

saveButton.addEventListener(
    "click",
    function () {

        const settings = {

            blockingThreshold:
                Number(
                    threshold.value
                )

        };


        chrome.storage.local.set(
            {

                settings:
                    settings,

                siteOverrides:
                    websites

            },
            function () {

                saveMessage.textContent =
                    "Settings saved successfully!";


                // Remove message after 3 seconds
                setTimeout(
                    function () {

                        saveMessage.textContent =
                            "";

                    },
                    3000
                );

            }
        );

    }
);
