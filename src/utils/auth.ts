/**
 * Token storage and validation (no fetch — HTTP lives in api.ts).
 */
import { getApiBaseUrl } from "./apiConfig";

export const isValidJWT = (token: string | null): boolean => {
    if (!token) return false;
    const parts = token.split(".");
    return parts.length === 3;
};

export const isMockToken = (token: string | null): boolean => {
    if (!token) return false;
    return token === "mock-admin-token" || token === "mock-user-token" || token === "mock-jwt-token";
};

export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
};

export const getValidToken = (): string | null => {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    if (isMockToken(token)) {
        console.warn("Token mock lama terdeteksi. Silakan login kembali.");
        clearAuth();
        return null;
    }

    if (!isValidJWT(token)) {
        console.warn("Format token tidak valid. Silakan login kembali.");
        clearAuth();
        return null;
    }

    return token;
};

let refreshInFlight: Promise<string | null> | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async (): Promise<string | null> => {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            return null;
        }

        try {
            const base = getApiBaseUrl();
            const res = await fetch(`${base.replace(/\/$/, "")}/api/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (res.status === 401) {
                clearAuth();
                return null;
            }

            if (!res.ok) {
                throw new Error("Gagal memperbarui token");
            }

            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem("token", data.token);
                return data.token;
            }

            return null;
        } catch (error) {
            console.error("Gagal memperbarui token:", error);
            if (error instanceof TypeError) {
                return null;
            }
            clearAuth();
            return null;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
};

export const isTokenExpired = (token: string | null): boolean => {
    if (!token || !isValidJWT(token)) return true;

    try {
        const parts = token.split(".");
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, "=");

        const decoded =
            typeof globalThis.atob === "function"
                ? globalThis.atob(padded)
                : Buffer.from(padded, "base64").toString("utf-8");

        const payload = JSON.parse(decoded);
        const exp = payload.exp;

        if (!exp) return true;

        const now = Math.floor(Date.now() / 1000);
        return exp < now + 60;
    } catch {
        return true;
    }
};
