"use client";

import type { Dispatch, SetStateAction } from "react";
import type { StudentDirectoryItem } from "./types";
import { formatShortAddress } from "./adminFormat";

export function SessionAllowlistPanel({
    allowlistSessionId,
    setAllowlistSessionId,
    onReloadSessionAllowlist,
    studentDirectoryQuery,
    setStudentDirectoryQuery,
    studentDirectoryLoading,
    studentDirectory,
    draftAllowlist,
    setDraftAllowlist,
    allowlistAddresses,
    allowlistBusy,
    onSaveSessionAllowlist,
    onOpenStudentPicker,
}: {
    allowlistSessionId: number;
    setAllowlistSessionId: (v: number) => void;
    onReloadSessionAllowlist: (sessionId: number) => void;
    studentDirectoryQuery: string;
    setStudentDirectoryQuery: (v: string) => void;
    studentDirectoryLoading: boolean;
    studentDirectory: StudentDirectoryItem[];
    draftAllowlist: { value: string; label: string }[];
    setDraftAllowlist: Dispatch<SetStateAction<{ value: string; label: string }[]>>;
    allowlistAddresses: string[];
    allowlistBusy: boolean;
    onSaveSessionAllowlist: () => void;
    onOpenStudentPicker?: () => void;
}) {
    const allowlistEntryCount = draftAllowlist.length;

    return (
        <div className="glass-panel p-4 sm:p-6 rounded-xl md:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold mb-2 text-white">Batas Pemilih per Sesi</h2>
            <p className="text-sm text-gray-400 mb-4">
                Cari mahasiswa dan tambahkan ke daftar *draft*. Jika daftar kosong, semua pemegang Student NFT bisa memilih di sesi ini.
                {onOpenStudentPicker && (
                    <>
                        {" "}
                        <button
                            type="button"
                            onClick={onOpenStudentPicker}
                            className="text-blue-300 hover:text-blue-200 underline font-medium"
                        >
                            Buka modal pilih
                        </button>
                    </>
                )}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5 border border-white/10">
                        <span className="text-gray-400 text-sm font-semibold">ID Sesi:</span>
                        <input
                            type="number"
                            min={1}
                            value={allowlistSessionId}
                            onChange={(e) => setAllowlistSessionId(Number(e.target.value))}
                            className="flex-1 bg-transparent focus:outline-none text-white text-sm font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => onReloadSessionAllowlist(allowlistSessionId)}
                            className="text-xs px-3 py-1.5 rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 font-bold transition"
                        >
                            Muat Ulang Sesi
                        </button>
                    </div>

                    <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                        <input
                            type="text"
                            placeholder="Cari Nama atau NIM Mahasiswa..."
                            value={studentDirectoryQuery}
                            onChange={(e) => setStudentDirectoryQuery(e.target.value)}
                            className="w-full bg-dark-800 border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />

                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {studentDirectoryLoading ? (
                                <p className="text-xs text-gray-500 text-center py-4">Mencari...</p>
                            ) : studentDirectory.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-4">Ketik nama/NIM untuk mencari.</p>
                            ) : (
                                studentDirectory.map((student) => {
                                    const isAdded = !!(
                                        draftAllowlist.some((d) => d.value === student.studentId) ||
                                        (student.claimedBy &&
                                            draftAllowlist.some((d) => d.value === student.claimedBy!.toLowerCase()))
                                    );

                                    return (
                                        <div
                                            key={student.studentId}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition group"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <p className="text-sm font-semibold text-white truncate">{student.name}</p>
                                                <div className="flex gap-2 text-xs font-mono text-gray-400 mt-1">
                                                    <span>{student.studentId}</span>
                                                    {student.claimedBy ? (
                                                        <span className="text-emerald-400/80">
                                                            ({formatShortAddress(student.claimedBy)})
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-400/80">(No Wallet)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const toAdd = student.claimedBy
                                                        ? student.claimedBy.toLowerCase()
                                                        : student.studentId;
                                                    if (!draftAllowlist.some((d) => d.value === toAdd)) {
                                                        setDraftAllowlist([
                                                            ...draftAllowlist,
                                                            { value: toAdd, label: student.name },
                                                        ]);
                                                    }
                                                }}
                                                disabled={isAdded}
                                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                                    isAdded
                                                        ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                                        : "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30"
                                                }`}
                                            >
                                                {isAdded ? "✓ Ditambahkan" : "+ Tambah"}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 flex flex-col h-full">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col min-h-[250px]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-white">
                                    Draft Pemilih (Sesi #{allowlistSessionId})
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">{allowlistEntryCount} entri dipilih</p>
                            </div>
                            {draftAllowlist.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setDraftAllowlist([])}
                                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                                >
                                    Bersihkan Semua
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded-lg bg-black/20 p-3">
                            {draftAllowlist.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm text-gray-500 text-center px-4">
                                        Draft kosong. Semua mahasiswa bisa memilih.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {draftAllowlist.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 text-blue-100 px-3 py-1.5 rounded-full text-xs font-semibold group"
                                        >
                                            <span className="truncate max-w-[150px]" title={entry.value}>
                                                {entry.label}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDraftAllowlist(
                                                        draftAllowlist.filter((e) => e.value !== entry.value)
                                                    )
                                                }
                                                className="text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-full w-5 h-5 flex items-center justify-center transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 relative">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onSaveSessionAllowlist}
                                    disabled={allowlistBusy}
                                    className="flex-1 py-3 rounded-lg font-bold transition bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    {allowlistBusy ? "Menyimpan ke Blockchain..." : "Simpan ke Blockchain"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDraftAllowlist(
                                            allowlistAddresses.map((addr) => ({
                                                value: addr,
                                                label: formatShortAddress(addr),
                                            }))
                                        )
                                    }
                                    title="Kembalikan draft seperti daftar yang tersimpan di Blockchain."
                                    className="px-4 py-3 rounded-lg font-semibold transition bg-white/10 hover:bg-white/20 text-gray-300 text-sm whitespace-nowrap border border-white/10"
                                >
                                    Reset
                                </button>
                            </div>
                            <div className="text-center mt-1">
                                {allowlistAddresses.length === 0 && draftAllowlist.length > 0 && (
                                    <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded inline-block">
                                        Membatasi ke {draftAllowlist.length} pemilih.
                                    </span>
                                )}
                                {allowlistAddresses.length > 0 && draftAllowlist.length === 0 && (
                                    <span className="text-[10px] text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded inline-block">
                                        Menghapus batas! Semua akun bisa memilih.
                                    </span>
                                )}
                                {allowlistAddresses.length > 0 && draftAllowlist.length > 0 && (
                                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded inline-block">
                                        Update batas ke {draftAllowlist.length} pemilih.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
