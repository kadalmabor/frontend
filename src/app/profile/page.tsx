"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import VotingArtifact from "../../contracts/VotingSystem.json";
import Link from "next/link";

export default function ProfilePage() {
    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [hasNft, setHasNft] = useState<boolean | null>(null);
    const { account, isConnected, connectWallet, disconnectWallet, provider } = useWallet();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        const storedRole = localStorage.getItem("role");

        if (!token || !storedUsername) {
            router.push("/login");
            return;
        }

        setUsername(storedUsername);
        setRole(storedRole);
    }, []);

    // Cek kepemilikan NFT
    useEffect(() => {
        const checkNft = async () => {
            if (!account || !provider) {
                setHasNft(false);
                return;
            }
            try {
                const contract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS!,
                    VotingArtifact.abi,
                    provider
                );
                const balance = await contract.balanceOf(account);
                setHasNft(Number(balance) > 0);
            } catch {
                setHasNft(false);
            }
        };
        checkNft();
    }, [account, provider]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
    };

    if (!username) return null;

    const isAdmin = role === "admin";

    const quickLinks = [
        { href: "/vote", label: "🗳️ Halaman Voting", color: "bg-blue-600/20 hover:bg-blue-600/30 text-blue-200" },
        { href: "/results", label: "📊 Lihat Hasil", color: "bg-purple-600/20 hover:bg-purple-600/30 text-purple-200" },
        { href: "/history", label: "📜 Riwayat Voting", color: "bg-green-600/20 hover:bg-green-600/30 text-green-200" },
        ...(isAdmin ? [{ href: "/admin", label: "⚙️ Admin Dashboard", color: "bg-orange-600/20 hover:bg-orange-600/30 text-orange-200" }] : []),
    ];

    return (
        <div className="min-h-screen bg-dark-900 pt-20 px-4 pb-12">
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Profile Header */}
                <div className="bg-white/5 p-6 sm:p-8 rounded-2xl backdrop-blur-xl border border-white/10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-purple-500/30">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{username}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold mt-1 ${isAdmin
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/20"
                        : "bg-white/10 text-white/60 border border-white/10"
                        }`}>
                        {isAdmin ? "👑 Admin" : "🎓 Mahasiswa"}
                    </span>
                </div>

                {/* Info NIM & NFT */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Informasi Akun</h2>
                    </div>
                    <div className="divide-y divide-white/10">
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-gray-400 text-sm">NIM / Username</span>
                            <span className="text-white font-mono text-sm font-semibold">{username}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-gray-400 text-sm">Role</span>
                            <span className="text-white text-sm capitalize">{role}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-gray-400 text-sm">Status NFT</span>
                            {hasNft === null ? (
                                <span className="text-gray-500 text-sm">Mengecek...</span>
                            ) : hasNft ? (
                                <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Student NFT Aktif
                                </span>
                            ) : (
                                <Link href="/bind-wallet" className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition">
                                    ⚠️ Belum Punya NFT →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wallet Status */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Wallet</h2>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                        {isConnected ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                                    <span className="text-green-300 text-xs font-mono break-all">{account}</span>
                                </div>
                                <button
                                    onClick={disconnectWallet}
                                    className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition text-sm border border-red-500/20"
                                >
                                    Putuskan Wallet
                                </button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                                    <span className="text-gray-400 text-sm">Tidak ada wallet yang terhubung.</span>
                                </div>
                                <button
                                    onClick={connectWallet}
                                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition text-sm"
                                >
                                    Hubungkan Wallet
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu Cepat</h2>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition ${link.color}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm font-semibold"
                >
                    Keluar dari Akun
                </button>

            </div>
        </div>
    );
}
