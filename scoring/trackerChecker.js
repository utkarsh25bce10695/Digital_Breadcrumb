function createTrackerChecker(trackerDomains) {

    const trackerSet = new Set(
        trackerDomains
            .map(domain => domain.toLowerCase().trim())
            .filter(Boolean)
    );

    function isTracker(domain) {

        if (!domain) {
            return false;
        }

        let cleanDomain = domain
            .toLowerCase()
            .trim()
            .replace(/^\.+/, "");

        if (trackerSet.has(cleanDomain)) {
            return true;
        }

        const parts = cleanDomain.split(".");

        for (let i = 1; i < parts.length - 1; i++) {

            const parentDomain = parts
                .slice(i)
                .join(".");

            if (trackerSet.has(parentDomain)) {
                return true;
            }
        }

        return false;
    }

    return {
        isTracker
    };
}

export { createTrackerChecker };
