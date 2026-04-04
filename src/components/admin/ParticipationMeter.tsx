"use client";

export function ParticipationMeter({
    rate,
    loading,
    denominatorLabel,
}: {
    rate: number;
    loading: boolean;
    denominatorLabel: string;
}) {
    const color =
        rate >= 70 ? "from-emerald-500 to-emerald-400" : rate >= 40 ? "from-blue-500 to-blue-400" : "from-amber-500 to-amber-400";
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Tingkat Partisipasi</span>
                {loading ? (
                    <div className="h-5 w-12 bg-white/10 rounded animate-pulse" />
                ) : (
                    <span className="text-sm font-bold text-white">{rate.toFixed(1)}%</span>
                )}
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
                    style={{ width: loading ? "0%" : `${Math.min(rate, 100)}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Rasio pemilih aktif terhadap total {denominatorLabel.toLowerCase()}
            </p>
        </div>
    );
}
