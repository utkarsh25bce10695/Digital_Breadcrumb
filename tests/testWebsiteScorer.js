import { scoreWebsite } from "../scoring/websiteScorer.js";

const websiteCookies = [
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

const result = scoreWebsite(
    "example.com",
    websiteCookies
);

console.log(JSON.stringify(result, null, 4));