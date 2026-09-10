import { createTrackerChecker } from "../scoring/trackerChecker.js";
import fs from "fs";

const trackerData = JSON.parse(
    fs.readFileSync("./data/trackers.json", "utf-8")
);

const trackerChecker = createTrackerChecker(
    trackerData.trackers
);

const testDomains = [
    "google.com",
    "doubleclick.net",
    "example.com",
    ".google.com"
];

for (const domain of testDomains) {
    const result = trackerChecker.isTracker(domain);

    console.log(
        `${domain} → ${result ? "TRACKER" : "NOT A TRACKER"}`
    );
}