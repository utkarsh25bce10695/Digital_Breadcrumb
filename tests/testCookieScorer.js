import { scoreCookie } from "../scoring/cookieScorer.js";

const cookies = [
    {
        name: "analytics_id",
        isTracker: true,
        isThirdParty: true,
        expirationDays: 730,
        secure: false,
        httpOnly: false
    },
    {
        name: "session_id",
        isTracker: false,
        isThirdParty: false,
        expirationDays: 1,
        secure: true,
        httpOnly: true
    },
    {
        name: "advertising_cookie",
        isTracker: true,
        isThirdParty: true,
        expirationDays: 90,
        secure: true,
        httpOnly: false
    }
];

for (const cookie of cookies) {
    const result = scoreCookie(cookie);

    console.log(`\nCookie: ${cookie.name}`);
    console.log(`Score: ${result.score}`);
    console.log(`Classification: ${result.classification}`);
    console.log(`Reasons: ${result.reasons.join(", ") || "None"}`);
}