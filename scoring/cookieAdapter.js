import { createTrackerChecker } from "./trackerChecker.js";

function adaptCookie(rawCookie, websiteDomain, trackerData) {
    const trackerChecker = createTrackerChecker(
        trackerData.trackers || []
    );

    const cookieDomain = normalizeDomain(rawCookie.domain);
    const siteDomain = normalizeDomain(websiteDomain);

    const isTracker = trackerChecker.isTracker(cookieDomain);

    const isThirdParty = !isSameSite(cookieDomain, siteDomain);

    const expirationDays = calculateExpirationDays(
        rawCookie.expirationDate
    );

    return {
        name: rawCookie.name,
        isTracker,
        isThirdParty,
        expirationDays,
        secure: rawCookie.secure === true,
        httpOnly: rawCookie.httpOnly === true
    };
}

function normalizeDomain(domain) {
    if (!domain) {
        return "";
    }

    return domain
        .toLowerCase()
        .trim()
        .replace(/^\.+/, "")
        .replace(/\.$/, "");
}

function isSameSite(cookieDomain, websiteDomain) {
    if (!cookieDomain || !websiteDomain) {
        return false;
    }

    if (cookieDomain === websiteDomain) {
        return true;
    }

    return (
        cookieDomain.endsWith("." + websiteDomain) ||
        websiteDomain.endsWith("." + cookieDomain)
    );
}

function calculateExpirationDays(expirationDate) {
    if (
        expirationDate === undefined ||
        expirationDate === null ||
        !Number.isFinite(expirationDate)
    ) {
        return 0;
    }

    const nowSeconds = Date.now() / 1000;
    const secondsRemaining = expirationDate - nowSeconds;

    return Math.max(
        0,
        Math.ceil(secondsRemaining / (60 * 60 * 24))
    );
}

export { adaptCookie };