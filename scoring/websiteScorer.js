import { scoreCookie } from "./cookieScorer.js";

function scoreWebsite(website, cookies) {

    if (!Array.isArray(cookies) || cookies.length === 0) {
        return {
            website,
            websiteScore: 100,
            totalCookies: 0,
            cookies: []
        };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    const scoredCookies = [];

    for (const cookie of cookies) {

        const result = scoreCookie(cookie);

        scoredCookies.push({
            name: cookie.name,
            score: result.score,
            classification: result.classification,
            reasons: result.reasons
        });

        let weight = 1;

        if (cookie.isTracker === true) {
            weight += 0.5;
        }

        if (cookie.isThirdParty === true) {
            weight += 0.5;
        }

        totalWeightedScore += result.score * weight;
        totalWeight += weight;
    }

    const score = Math.round(
        totalWeightedScore / totalWeight
    );

    return {
        website,
        websiteScore: score,
        totalCookies: cookies.length,
        cookies: scoredCookies
    };
}

export { scoreWebsite };
