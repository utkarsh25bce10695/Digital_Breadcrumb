import { scoreCookie } from "./cookieScorer.js";

/**
 * Calculates the overall privacy score of a website
 * based on the cookies detected on that website.
 *
 * @param {string} website
 * @param {Object[]} cookies
 * @returns {Object}
 */
function scoreWebsite(website, cookies) {
    // If there are no cookies
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

        // Store individual cookie result
        scoredCookies.push({
            name: cookie.name,
            score: result.score,
            classification: result.classification,
            reasons: result.reasons
        });

        // Same weighting logic as before
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

    // Weighted average
    const score = Math.round(totalWeightedScore / totalWeight);

    return {
        website,
        websiteScore: score,
        totalCookies: cookies.length,
        cookies: scoredCookies
    };
}

export { scoreWebsite };