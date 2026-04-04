export const formatShortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

export const unresolvedReasonLabel = (reason: string): string => {
    if (reason === "not_found") return "akun tidak ditemukan";
    if (reason === "inactive") return "akun nonaktif";
    if (reason === "wallet_not_bound") return "wallet belum di-bind";
    return reason;
};

export const formatTime = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
