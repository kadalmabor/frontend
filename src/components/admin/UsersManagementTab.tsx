"use client";

import type { BulkImportFailure, BulkImportSummary } from "./types";

export function UsersManagementTab({
    newUserName,
    setNewUserName,
    newUserStudentId,
    setNewUserStudentId,
    newUserPassword,
    setNewUserPassword,
    loading,
    onAddUser,
    bulkImportFile,
    setBulkImportFile,
    bulkImportLoading,
    bulkImportInputKey,
    bulkImportSummary,
    bulkImportFailedRows,
    onBulkImport,
}: {
    newUserName: string;
    setNewUserName: (v: string) => void;
    newUserStudentId: string;
    setNewUserStudentId: (v: string) => void;
    newUserPassword: string;
    setNewUserPassword: (v: string) => void;
    loading: boolean;
    onAddUser: () => void;
    bulkImportFile: File | null;
    setBulkImportFile: (f: File | null) => void;
    bulkImportLoading: boolean;
    bulkImportInputKey: number;
    bulkImportSummary: BulkImportSummary | null;
    bulkImportFailedRows: BulkImportFailure[];
    onBulkImport: () => void;
}) {
    return (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-panel p-6 rounded-xl max-w-3xl mx-auto w-full mt-4">
                <h2 className="text-xl font-bold mb-4 text-white">Tambah Voter Baru</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white text-sm"
                    />
                    <input
                        type="text"
                        placeholder="NIM (Username)"
                        value={newUserStudentId}
                        onChange={(e) => setNewUserStudentId(e.target.value)}
                        className="bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white text-sm"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={onAddUser}
                    disabled={loading}
                    className="w-full mt-4 py-3 rounded-lg font-bold transition bg-purple-600 hover:bg-purple-500 text-white"
                >
                    {loading ? "Membuat User..." : "Buat User Baru"}
                </button>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white">Import Massal (CSV / Excel)</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Kolom wajib: <span className="font-mono text-gray-300">studentId/nim</span> dan{" "}
                        <span className="font-mono text-gray-300">name/nama</span>. Semua akun hasil import akan memakai
                        password default <span className="font-mono text-gray-300">password123</span>.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                            key={bulkImportInputKey}
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                            className="flex-1 bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
                        />
                        <button
                            type="button"
                            onClick={onBulkImport}
                            disabled={bulkImportLoading}
                            className="px-5 py-2.5 rounded-lg font-bold transition bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                        >
                            {bulkImportLoading ? "Mengimpor..." : "Import Akun"}
                        </button>
                    </div>

                    {bulkImportSummary && (
                        <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                            <p className="text-white font-semibold">Ringkasan Import</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                <p className="text-gray-300">
                                    Total Baris:{" "}
                                    <span className="text-white font-bold">{bulkImportSummary.totalRows}</span>
                                </p>
                                <p className="text-emerald-300">
                                    Berhasil: <span className="font-bold">{bulkImportSummary.created}</span>
                                </p>
                                <p className="text-red-300">
                                    Gagal: <span className="font-bold">{bulkImportSummary.failed}</span>
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Password default untuk akun baru dikonfigurasi di server (tidak ditampilkan di sini).
                            </p>
                        </div>
                    )}

                    {bulkImportFailedRows.length > 0 && (
                        <div className="mt-3 bg-red-950/30 border border-red-500/30 rounded-lg p-3 max-h-56 overflow-y-auto">
                            <p className="text-sm font-semibold text-red-300 mb-2">Baris Gagal</p>
                            <div className="space-y-1.5 text-xs">
                                {bulkImportFailedRows.map((item, index) => (
                                    <p
                                        key={`${item.line}-${item.studentId || "empty"}-${index}`}
                                        className="text-red-200"
                                    >
                                        Baris {item.line}
                                        {item.studentId ? ` (${item.studentId})` : ""}: {item.reason}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
