"use client";

export function StatCard({
    label,
    value,
    sub,
    icon,
    color = "blue",
    loading = false,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: string;
    color?: "blue" | "green" | "amber";
    loading?: boolean;
}) {
    const colorMap = {
        blue: "from-blue-600/20 to-blue-500/10 border-blue-500/30",
        green: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/30",
        amber: "from-amber-600/20 to-amber-500/10 border-amber-500/30",
    };
    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4 flex flex-col gap-1`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
            </div>
            {loading ? (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
                <p className="text-3xl font-bold text-white">{value}</p>
            )}
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
    );
}
