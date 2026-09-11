function scoreCookie(cookie) {
    let score = 100;
    const reasons = [];

    if (cookie.isTracker === true) {
        score -= 40;
        reasons.push("Known tracker");
    }

    if (cookie.isThirdParty === true) {
        score -= 25;
        reasons.push("Third-party cookie");
    }

    if (cookie.expirationDays !== undefined) {
        if (cookie.expirationDays > 365) {
            score -= 20;
            reasons.push("Very long lifetime");
        } else if (cookie.expirationDays > 30) {
            score -= 10;
            reasons.push("Long lifetime");
        }
    }

    if (cookie.secure !== true) {
        score -= 5;
        reasons.push("Secure flag not enabled");
    }

    if (cookie.httpOnly !== true) {
        score -= 5;
        reasons.push("HttpOnly flag not enabled");
    }

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
