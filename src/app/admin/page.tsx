"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../context/WalletContext";
import VotingArtifact from "../../contracts/VotingSystem.json";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { authApiFetch, getApiBaseUrl } from "../../utils/api";
import { getRpcErrorMessage } from "../../utils/rpcError";
import { AdminTabBar } from "../../components/admin/AdminTabBar";
import { MonitorSessionsTab } from "../../components/admin/MonitorSessionsTab";
import { ManageSessionsTab } from "../../components/admin/ManageSessionsTab";
import { UsersManagementTab } from "../../components/admin/UsersManagementTab";
import { StudentPickerModal } from "../../components/admin/StudentPickerModal";
import { getAllowlistContract } from "../../components/admin/adminContract";
import { formatShortAddress, unresolvedReasonLabel } from "../../components/admin/adminFormat";
import type {
    AdminTab,
    BulkImportFailure,
    BulkImportSummary,
    ResolvedVoter,
    Session,
    SessionStats,
    StudentDirectoryItem,
    UnresolvedVoter,
} from "../../components/admin/types";

export default function AdminPage() {
    const { provider, isConnected } = useWallet();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [allowlistBusy, setAllowlistBusy] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>("monitor");

    const [sessionName, setSessionName] = useState("");
    const [sessionDesc, setSessionDesc] = useState("");
    const [sessionDuration, setSessionDuration] = useState(7);

    const [sessions, setSessions] = useState<Session[]>([]);

    const [candidateName, setCandidateName] = useState("");
    const [candidatePhotoUrl, setCandidatePhotoUrl] = useState("");
    const [candidateVision, setCandidateVision] = useState("");
    const [candidateMission, setCandidateMission] = useState("");
    const [targetSessionId, setTargetSessionId] = useState(1);
    const [allowlistSessionId, setAllowlistSessionId] = useState(1);
    const [draftAllowlist, setDraftAllowlist] = useState<{ value: string; label: string }[]>([]);
    const [allowlistAddresses, setAllowlistAddresses] = useState<string[]>([]);
    const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
    const [studentDirectoryQuery, setStudentDirectoryQuery] = useState("");
    const [studentDirectoryLoading, setStudentDirectoryLoading] = useState(false);
    const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryItem[]>([]);

    const [newUserName, setNewUserName] = useState("");
    const [newUserStudentId, setNewUserStudentId] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
    const [bulkImportLoading, setBulkImportLoading] = useState(false);
    const [bulkImportSummary, setBulkImportSummary] = useState<BulkImportSummary | null>(null);
    const [bulkImportFailedRows, setBulkImportFailedRows] = useState<BulkImportFailure[]>([]);
    const [bulkImportInputKey, setBulkImportInputKey] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [detailSessionId, setDetailSessionId] = useState<number | null>(null);
    const [stats, setStats] = useState<SessionStats>({
        totalNFTHolders: 0,
        uniqueVoterCount: 0,
        participationRate: "0",
        registeredLabel: "Pemegang Student NFT",
        loading: false,
    });

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        if (provider) fetchSessions();
    }, [provider, refreshKey]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible" && provider) fetchSessions();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [provider]);

    useEffect(() => {
        const socket = io(getApiBaseUrl());
        socket.on("connect", () => {
            console.log("🟢 Admin terhubung ke pembaruan real-time");
        });
        socket.on("session_created", () => setRefreshKey((prev) => prev + 1));
        socket.on("session_update", () => setRefreshKey((prev) => prev + 1));
        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchStudentDirectory = async (keyword = "", silent = false) => {
        setStudentDirectoryLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("limit", "500");
            if (keyword.trim()) params.set("q", keyword.trim());

            const response = await authApiFetch(`/api/users/list?${params.toString()}`, { method: "GET" });
            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.error || "Gagal memuat daftar mahasiswa");
            }

            setStudentDirectory((payload.students || []) as StudentDirectoryItem[]);
        } catch (err: unknown) {
            if (!silent) {
                toast.error(err instanceof Error ? err.message : "Gagal memuat daftar mahasiswa");
            }
        }
        setStudentDirectoryLoading(false);
    };

    const resolveAllowlistEntries = async (entries: string[]) => {
        const addresses: string[] = [];
        const seenAddresses = new Set<string>();
        const studentIds: string[] = [];
        const invalidAddresses: string[] = [];

        for (const entry of entries) {
            if (entry.startsWith("0x")) {
                if (!ethers.isAddress(entry)) {
                    invalidAddresses.push(entry);
                    continue;
                }
                const checksum = ethers.getAddress(entry);
                const key = checksum.toLowerCase();
                if (!seenAddresses.has(key)) {
                    seenAddresses.add(key);
                    addresses.push(checksum);
                }
                continue;
            }
            studentIds.push(entry);
        }

        if (invalidAddresses.length > 0) {
            throw new Error(`Alamat wallet tidak valid: ${invalidAddresses.join(", ")}`);
        }

        let unresolved: UnresolvedVoter[] = [];
        if (studentIds.length > 0) {
            const response = await authApiFetch("/api/users/resolve-voter-addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds }),
            });
            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.error || "Gagal me-resolve akun ke wallet");
            }

            const resolvedRows = (payload.resolved || []) as ResolvedVoter[];
            unresolved = (payload.unresolved || []) as UnresolvedVoter[];

            for (const row of resolvedRows) {
                if (!ethers.isAddress(row.address)) continue;
                const checksum = ethers.getAddress(row.address);
                const key = checksum.toLowerCase();
                if (!seenAddresses.has(key)) {
                    seenAddresses.add(key);
                    addresses.push(checksum);
                }
            }
        }

        return { addresses, unresolved };
    };

    const fetchSessions = async () => {
        try {
            const readProvider = provider || new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS!,
                VotingArtifact.abi,
                readProvider
            );

            const data = await contract.getAllSessions();
            const formattedSessions = data.map((s: Record<string, unknown>) => ({
                id: Number(s.id),
                name: s.name as string,
                description: s.description as string,
                startTime: Number(s.startTime),
                endTime: Number(s.endTime),
                isActive: s.isActive as boolean,
            }));

            formattedSessions.sort((a: Session, b: Session) => a.id - b.id);
            setSessions(formattedSessions);
        } catch (err) {
            console.error("Kesalahan saat memuat sesi:", err);
            toast.error(getRpcErrorMessage(err));
        }
    };

    const fetchSessionAllowlist = async (sessionId: number) => {
        try {
            const readProvider = provider || new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const contract = getAllowlistContract(readProvider);
            const sessionsCount = Number(await contract.sessionsCount());
            if (sessionId < 1 || sessionId > sessionsCount) {
                setAllowlistAddresses([]);
                setDraftAllowlist([]);
                return;
            }
            const voters = await contract.getSessionAllowedVoters(sessionId);
            const normalized = voters.map((address: string) => ethers.getAddress(address));
            setAllowlistAddresses(normalized);
            setDraftAllowlist(normalized.map((addr: string) => ({ value: addr, label: formatShortAddress(addr) })));
        } catch (err) {
            console.error("Kesalahan saat memuat daftar pemilih sesi:", err);
            setAllowlistAddresses([]);
            setDraftAllowlist([]);
        }
    };

    useEffect(() => {
        if (sessions.length === 0) return;
        if (!sessions.some((s) => s.id === allowlistSessionId)) {
            setAllowlistSessionId(sessions[sessions.length - 1].id);
        }
    }, [sessions, allowlistSessionId]);

    useEffect(() => {
        if (!provider || allowlistSessionId <= 0) return;
        fetchSessionAllowlist(allowlistSessionId);
    }, [provider, allowlistSessionId, refreshKey]);

    useEffect(() => {
        if (!isConnected) return;
        if (localStorage.getItem("role") !== "admin") return;

        const timer = setTimeout(() => {
            if (isStudentPickerOpen) {
                fetchStudentDirectory(studentDirectoryQuery, true);
            } else {
                fetchStudentDirectory(studentDirectoryQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [isConnected, isStudentPickerOpen, studentDirectoryQuery]);

    const fetchSessionStats = async (sessionId: number) => {
        if (detailSessionId === sessionId) {
            setDetailSessionId(null);
            return;
        }
        setDetailSessionId(sessionId);
        setStats((prev) => ({ ...prev, loading: true }));

        try {
            const readProvider = provider || new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const contract = getAllowlistContract(readProvider);

            let totalNFTHolders = 0;
            let registeredLabel = "Pemegang Student NFT";
            try {
                const sessionsCount = Number(await contract.sessionsCount());
                if (sessionId >= 1 && sessionId <= sessionsCount) {
                    const restrictedVoters = await contract.getSessionAllowedVoters(sessionId);
                    if (restrictedVoters.length > 0) {
                        totalNFTHolders = restrictedVoters.length;
                        registeredLabel = "Daftar pemilih sesi";
                    } else {
                        const nextId = await contract.nextTokenId();
                        totalNFTHolders = Number(nextId);
                    }
                } else {
                    const nextId = await contract.nextTokenId();
                    totalNFTHolders = Number(nextId);
                }
            } catch (e) {
                console.warn("Could not fetch voter denominator:", e);
                try {
                    const nextId = await contract.nextTokenId();
                    totalNFTHolders = Number(nextId);
                } catch (nextIdError) {
                    console.warn("Could not fetch nextTokenId fallback:", nextIdError);
                }
            }

            let uniqueVoterCount = 0;
            try {
                const CHUNK_SIZE = 9000;
                const deployBlock = Number(process.env.NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK ?? 0);
                const latestBlock = await readProvider.getBlockNumber();
                const filter = contract.filters.Voted(sessionId, null, null);
                const voterAddresses = new Set<string>();
                for (let from = deployBlock; from <= latestBlock; from += CHUNK_SIZE) {
                    const to = Math.min(from + CHUNK_SIZE - 1, latestBlock);
                    const chunk = await contract.queryFilter(filter, from, to);
                    for (const log of chunk) {
                        if (!(log instanceof ethers.EventLog)) continue;
                        const voter = log.args?.voter;
                        if (voter != null) voterAddresses.add(String(voter).toLowerCase());
                    }
                }
                uniqueVoterCount = voterAddresses.size;
            } catch (e) {
                console.warn("Could not fetch voter events:", e);
            }

            const participationRate =
                totalNFTHolders > 0 ? ((uniqueVoterCount / totalNFTHolders) * 100).toFixed(1) : "0.0";
            setStats({ totalNFTHolders, uniqueVoterCount, participationRate, registeredLabel, loading: false });
        } catch (err) {
            console.error("Kesalahan saat memuat statistik sesi:", err);
            setStats((prev) => ({ ...prev, loading: false }));
        }
    };

    const createSession = async () => {
        if (!provider || !sessionName) return;
        setLoading(true);
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS!,
                VotingArtifact.abi,
                signer
            );

            const now = Math.floor(Date.now() / 1000);
            const durationSeconds = sessionDuration * 24 * 60 * 60;
            const endTime = now + durationSeconds;

            const tx = await contract.createSession(sessionName, sessionDesc, now, endTime);
            await tx.wait();
            toast.success(`Sesi "${sessionName}" berhasil dibuat`);
            setSessionName("");
            setSessionDesc("");
            fetchSessions();
        } catch (err: unknown) {
            toast.error(getRpcErrorMessage(err));
        }
        setLoading(false);
    };

    const toggleSessionStatus = async (sessionId: number, currentStatus: boolean) => {
        if (!provider) return;
        if (!confirm(`Are you sure you want to ${currentStatus ? "STOP" : "START"} this session?`)) return;

        setLoading(true);
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS!,
                VotingArtifact.abi,
                signer
            );

            const tx = await contract.setSessionStatus(sessionId, !currentStatus);
            await tx.wait();
            toast.success(`Sesi ${sessionId} status diperbarui`);
            fetchSessions();
        } catch (err: unknown) {
            toast.error(getRpcErrorMessage(err));
        }
        setLoading(false);
    };

    const addCandidate = async () => {
        if (!provider || !candidateName || !targetSessionId) return;
        setLoading(true);
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS!,
                VotingArtifact.abi,
                signer
            );

            const tx = await contract.addCandidate(
                targetSessionId,
                candidateName,
                candidatePhotoUrl,
                candidateVision,
                candidateMission
            );
            await tx.wait();
            toast.success(`Kandidat "${candidateName}" ditambahkan ke Sesi ${targetSessionId}`);
            setCandidateName("");
            setCandidatePhotoUrl("");
            setCandidateVision("");
            setCandidateMission("");
        } catch (err: unknown) {
            toast.error(getRpcErrorMessage(err));
        }
        setLoading(false);
    };

    const saveSessionAllowlist = async () => {
        if (!provider || !allowlistSessionId) return;

        setAllowlistBusy(true);
        try {
            const draftValues = draftAllowlist.map((d) => d.value);
            const { addresses, unresolved } = await resolveAllowlistEntries(draftValues);

            const signer = await provider.getSigner();
            const contract = getAllowlistContract(signer);
            const tx = await contract.setSessionAllowedVoters(allowlistSessionId, addresses);
            await tx.wait();

            await fetchSessionAllowlist(allowlistSessionId);
            toast.success(
                addresses.length > 0
                    ? `Daftar pemilih sesi ${allowlistSessionId} diperbarui (${addresses.length} wallet)`
                    : `Batasan pemilih sesi ${allowlistSessionId} dihapus (semua pemegang NFT bisa memilih)`
            );

            if (unresolved.length > 0) {
                const unresolvedText = unresolved
                    .map((item) => `${item.studentId} (${unresolvedReasonLabel(item.reason)})`)
                    .join(", ");
                toast.error(`Akun tidak dimasukkan: ${unresolvedText}`, { duration: 7000 });
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : getRpcErrorMessage(err));
        }
        setAllowlistBusy(false);
    };

    const handleAddUser = async () => {
        if (!newUserName || !newUserStudentId || !newUserPassword) {
            toast.error("Isi semua field");
            return;
        }
        setLoading(true);
        try {
            const res = await authApiFetch("/api/users/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newUserName,
                    studentId: newUserStudentId,
                    password: newUserPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("User berhasil dibuat");
                setNewUserName("");
                setNewUserStudentId("");
                setNewUserPassword("");
                fetchStudentDirectory(studentDirectoryQuery, true);
            } else {
                toast.error("Error: " + data.error);
            }
        } catch (err: unknown) {
            toast.error("Error: " + (err instanceof Error ? err.message : "unknown"));
        }
        setLoading(false);
    };

    const handleBulkImportUsers = async () => {
        if (!bulkImportFile) {
            toast.error("Pilih file CSV/Excel terlebih dahulu");
            return;
        }

        const filename = bulkImportFile.name.toLowerCase();
        if (!filename.endsWith(".csv") && !filename.endsWith(".xls") && !filename.endsWith(".xlsx")) {
            toast.error("Format file harus CSV, XLS, atau XLSX");
            return;
        }

        setBulkImportLoading(true);
        setBulkImportSummary(null);
        setBulkImportFailedRows([]);

        try {
            const formData = new FormData();
            formData.append("file", bulkImportFile);

            const res = await authApiFetch("/api/users/bulk-import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data?.summary) {
                setBulkImportSummary(data.summary as BulkImportSummary);
            }
            if (Array.isArray(data?.failed)) {
                setBulkImportFailedRows(data.failed as BulkImportFailure[]);
            }

            if (!res.ok || !data?.success) {
                throw new Error(data?.error || "Import akun gagal");
            }

            toast.success(data?.message || "Import akun berhasil");
            setBulkImportFile(null);
            setBulkImportInputKey((prev) => prev + 1);
            fetchStudentDirectory(studentDirectoryQuery, true);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Import akun gagal");
        }

        setBulkImportLoading(false);
    };

    if (!isConnected) return <div className="text-center pt-20">Silakan hubungkan wallet admin</div>;

    return (
        <div className="min-h-screen bg-dark-900 pt-20 px-4 pb-20">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Dasbor Admin
                </h1>

                <AdminTabBar activeTab={activeTab} onTabChange={setActiveTab} />

                {activeTab === "monitor" && (
                    <MonitorSessionsTab
                        sessions={sessions}
                        detailSessionId={detailSessionId}
                        stats={stats}
                        onToggleSessionStatus={toggleSessionStatus}
                        onFetchSessionStats={fetchSessionStats}
                        onCloseDetail={() => setDetailSessionId(null)}
                    />
                )}

                {activeTab === "manage" && (
                    <ManageSessionsTab
                        sessionName={sessionName}
                        setSessionName={setSessionName}
                        sessionDesc={sessionDesc}
                        setSessionDesc={setSessionDesc}
                        sessionDuration={sessionDuration}
                        setSessionDuration={setSessionDuration}
                        targetSessionId={targetSessionId}
                        setTargetSessionId={setTargetSessionId}
                        candidateName={candidateName}
                        setCandidateName={setCandidateName}
                        candidatePhotoUrl={candidatePhotoUrl}
                        setCandidatePhotoUrl={setCandidatePhotoUrl}
                        candidateVision={candidateVision}
                        setCandidateVision={setCandidateVision}
                        candidateMission={candidateMission}
                        setCandidateMission={setCandidateMission}
                        allowlistSessionId={allowlistSessionId}
                        setAllowlistSessionId={setAllowlistSessionId}
                        onReloadSessionAllowlist={fetchSessionAllowlist}
                        studentDirectoryQuery={studentDirectoryQuery}
                        setStudentDirectoryQuery={setStudentDirectoryQuery}
                        studentDirectoryLoading={studentDirectoryLoading}
                        studentDirectory={studentDirectory}
                        draftAllowlist={draftAllowlist}
                        setDraftAllowlist={setDraftAllowlist}
                        allowlistAddresses={allowlistAddresses}
                        allowlistBusy={allowlistBusy}
                        loading={loading}
                        setLoading={setLoading}
                        onCreateSession={createSession}
                        onAddCandidate={addCandidate}
                        onSaveSessionAllowlist={saveSessionAllowlist}
                        onOpenStudentPicker={() => {
                            setIsStudentPickerOpen(true);
                            fetchStudentDirectory(studentDirectoryQuery, true);
                        }}
                    />
                )}

                {activeTab === "users" && (
                    <UsersManagementTab
                        newUserName={newUserName}
                        setNewUserName={setNewUserName}
                        newUserStudentId={newUserStudentId}
                        setNewUserStudentId={setNewUserStudentId}
                        newUserPassword={newUserPassword}
                        setNewUserPassword={setNewUserPassword}
                        loading={loading}
                        onAddUser={handleAddUser}
                        bulkImportFile={bulkImportFile}
                        setBulkImportFile={setBulkImportFile}
                        bulkImportLoading={bulkImportLoading}
                        bulkImportInputKey={bulkImportInputKey}
                        bulkImportSummary={bulkImportSummary}
                        bulkImportFailedRows={bulkImportFailedRows}
                        onBulkImport={handleBulkImportUsers}
                    />
                )}
            </div>

            <StudentPickerModal
                open={isStudentPickerOpen}
                onClose={() => setIsStudentPickerOpen(false)}
                allowlistSessionId={allowlistSessionId}
                studentDirectoryQuery={studentDirectoryQuery}
                setStudentDirectoryQuery={setStudentDirectoryQuery}
                studentDirectoryLoading={studentDirectoryLoading}
                studentDirectory={studentDirectory}
                draftAllowlist={draftAllowlist}
                setDraftAllowlist={setDraftAllowlist}
                onReloadDirectory={(keyword) => fetchStudentDirectory(keyword)}
            />
        </div>
    );
}
