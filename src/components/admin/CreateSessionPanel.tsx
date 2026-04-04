"use client";

export function CreateSessionPanel({
    sessionName,
    setSessionName,
    sessionDesc,
    setSessionDesc,
    sessionDuration,
    setSessionDuration,
    loading,
    onCreateSession,
}: {
    sessionName: string;
    setSessionName: (v: string) => void;
    sessionDesc: string;
    setSessionDesc: (v: string) => void;
    sessionDuration: number;
    setSessionDuration: (v: number) => void;
    loading: boolean;
    onCreateSession: () => void;
}) {
    return (
        <div className="glass-panel p-4 sm:p-6 rounded-xl">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">Buat Sesi Baru</h2>
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Nama Sesi (cth. Pemira BEM 2026)"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-white text-sm"
                />
                <textarea
                    placeholder="Deskripsi sesi..."
                    rows={3}
                    value={sessionDesc}
                    onChange={(e) => setSessionDesc(e.target.value)}
                    className="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-white text-sm resize-none"
                />
                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5">
                    <span className="text-gray-400 text-sm flex-1">Durasi (hari):</span>
                    <input
                        type="number"
                        min={1}
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                        className="w-20 bg-dark-800 border border-gray-700 rounded-lg px-3 py-1.5 text-center focus:outline-none focus:border-blue-500 text-white text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={onCreateSession}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-bold transition bg-green-600 hover:bg-green-500 text-white text-sm disabled:opacity-50"
                >
                    {loading ? "Membuat..." : "✓ Buat Sesi"}
                </button>
            </div>
        </div>
    );
}
