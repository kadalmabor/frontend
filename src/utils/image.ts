const isSafeHttpUrl = (raw: string): boolean => {
    const t = raw.trim();
    if (!t) return false;
    if (t.startsWith("/")) return true;
    try {
        const u = new URL(t);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
};

/**
 * Normalize candidate image URLs; rejects non-http(s) schemes (e.g. javascript:).
 */
export const getValidImageUrl = (url: string | undefined): string => {
    if (!url) return "";

    if (!isSafeHttpUrl(url)) {
        return "";
    }

    // If it's a local development URL, strip the host to use the Next.js proxy rewrite
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
        return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, "");
    }

    if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
        return url.replace(/^http:\/\//i, "https://");
    }

    return url;
};
