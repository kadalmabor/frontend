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

export const getAdminSessionStatus = (session: { isActive: boolean; startTime: number; endTime: number }) => {
    if (!session.isActive) return "DITUTUP";
    const now = Math.floor(Date.now() / 1000);
    if (now < session.startTime) return "BELUM MULAI";
    if (now > session.endTime) return "BERAKHIR";
    return "AKTIF";
};

export const getAdminSessionStatusColor = (status: string) => {
    switch (status) {
        case "AKTIF":
            return "bg-green-500/20 text-green-400";
        case "BELUM MULAI":
            return "bg-amber-500/20 text-amber-400";
        case "BERAKHIR":
            return "bg-blue-500/20 text-blue-400";
        case "DITUTUP":
        default:
            return "bg-red-500/20 text-red-400";
    }
};
