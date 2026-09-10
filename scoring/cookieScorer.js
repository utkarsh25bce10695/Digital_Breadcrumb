/**
 * Calculates a privacy risk score for a cookie.
 *
 * Score:
 * 0   = Very high risk
 * 100 = Very low risk / safer
 *
 * @param {Object} cookie
 * @returns {Object} score, classification and reasons
 */
function scoreCookie(cookie) {
    let score = 100;
    const reasons = [];

    // 1. Known tracker
    if (cookie.isTracker === true) {
        score -= 40;
        reasons.push("Known tracker");
    }

    // 2. Third-party cookie
    if (cookie.isThirdParty === true) {
        score -= 25;
        reasons.push("Third-party cookie");
    }

    // 3. Long-lived cookie
    if (cookie.expirationDays !== undefined) {
        if (cookie.expirationDays > 365) {
            score -= 20;
            reasons.push("Very long lifetime");
        } else if (cookie.expirationDays > 30) {
            score -= 10;
            reasons.push("Long lifetime");
        }
    }

    // 4. Secure flag
    if (cookie.secure !== true) {
        score -= 5;
        reasons.push("Secure flag not enabled");
    }

    // 5. HttpOnly flag
    if (cookie.httpOnly !== true) {
        score -= 5;
        reasons.push("HttpOnly flag not enabled");
    }

    // Keep score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let classification;

    if (score < 40) {
        classification = "HIGH RISK";
    } else if (score < 70) {
        classification = "MEDIUM RISK";
    } else {
        classification = "LOW RISK";
    }

    return {
        score,
        classification,
        reasons
    };
}

export { scoreCookie };