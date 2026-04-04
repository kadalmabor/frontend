"use client";

import type { Dispatch, SetStateAction } from "react";
import type { StudentDirectoryItem } from "./types";
import { formatShortAddress } from "./adminFormat";

export function StudentPickerModal({
    open,
    onClose,
    allowlistSessionId,
    studentDirectoryQuery,
    setStudentDirectoryQuery,
    studentDirectoryLoading,
    studentDirectory,
    draftAllowlist,
    setDraftAllowlist,
    onReloadDirectory,
}: {
    open: boolean;
    onClose: () => void;
    allowlistSessionId: number;
    studentDirectoryQuery: string;
    setStudentDirectoryQuery: (v: string) => void;
    studentDirectoryLoading: boolean;
    studentDirectory: StudentDirectoryItem[];
    draftAllowlist: { value: string; label: string }[];
    setDraftAllowlist: Dispatch<SetStateAction<{ value: string; label: string }[]>>;
    onReloadDirectory: (keyword: string) => void;
}) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="w-full max-w-3xl max-h-[85vh] bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div>
                        <h3 className="text-lg font-bold text-white">Pilih Mahasiswa</h3>
                        <p className="text-xs text-gray-400">
                            Klik +NIM atau +Wallet untuk menambah ke input whitelist sesi #{allowlistSessionId}.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-300"
                    >
                        Tutup
                    </button>
                </div>

                <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Cari nama atau NIM..."
                        value={studentDirectoryQuery}
                        onChange={(e) => setStudentDirectoryQuery(e.target.value)}
                        className="flex-1 bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => onReloadDirectory(studentDirectoryQuery)}
                        className="text-sm px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-gray-300"
                    >
                        Muat Ulang
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[56vh]">
                    {studentDirectoryLoading ? (
                        <p className="text-sm text-gray-500">Memuat daftar mahasiswa...</p>
                    ) : studentDirectory.length === 0 ? (
                        <p className="text-sm text-gray-500">Mahasiswa tidak ditemukan.</p>
                    ) : (
                        <div className="space-y-2">
                            {studentDirectory.map((student) => (
                                <div
                                    key={student.studentId}
                                    className="bg-black/20 border border-white/10 rounded-lg p-2.5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm text-white font-semibold truncate">{student.name}</p>
                                            <p className="text-xs text-gray-400">NIM: {student.studentId}</p>
                                            <p
                                                className={`text-xs mt-1 ${student.claimedBy ? "text-emerald-400" : "text-amber-400"}`}
                                            >
                                                {student.claimedBy
                                                    ? `Wallet: ${formatShortAddress(student.claimedBy)}`
                                                    : "Wallet belum di-bind"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!draftAllowlist.some((d) => d.value === student.studentId)) {
                                                        setDraftAllowlist([
                                                            ...draftAllowlist,
                                                            { value: student.studentId, label: student.name },
                                                        ]);
                                                    }
                                                }}
                                                className="text-xs px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200"
                                            >
                                                + NIM
                                            </button>
                                            {student.claimedBy && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const wallet = student.claimedBy!.toLowerCase();
                                                        if (!draftAllowlist.some((d) => d.value === wallet)) {
                                                            setDraftAllowlist([
                                                                ...draftAllowlist,
                                                                { value: wallet, label: student.name },
                                                            ]);
                                                        }
                                                    }}
                                                    className="text-xs px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200"
                                                >
                                                    + Wallet
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
