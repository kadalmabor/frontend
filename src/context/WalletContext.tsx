"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import toast from "react-hot-toast";
import { getRpcErrorMessage } from "../utils/rpcError";

interface WalletContextType {
    account: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isConnected: boolean;
    provider: BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType>({
    account: null,
    connectWallet: async () => { },
    disconnectWallet: () => { },
    isConnected: false,
    provider: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const targetChainId = BigInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
    const targetChainHex = `0x${targetChainId.toString(16)}`;
    const targetChainName = process.env.NEXT_PUBLIC_CHAIN_NAME || (targetChainId === 31337n ? "Hardhat Localhost" : "Custom Network");
    const targetRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545/";
    const targetBlockExplorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL;

    const getInjectedProvider = () => {
        if (typeof window === "undefined") return null;
        return (window as any).ethereum;
    };

    const checkNetwork = useCallback(async (provider: BrowserProvider) => {
        const network = await provider.getNetwork();
        if (network.chainId !== targetChainId) {
            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: targetChainHex }]);
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    try {
                        await provider.send("wallet_addEthereumChain", [
                            {
                                chainId: targetChainHex,
                                chainName: targetChainName,
                                rpcUrls: [targetRpcUrl],
                                nativeCurrency: {
                                    name: "ETH",
                                    symbol: "ETH",
                                    decimals: 18,
                                },
                                ...(targetBlockExplorerUrl ? { blockExplorerUrls: [targetBlockExplorerUrl] } : {}),
                            },
                        ]);
                        await provider.send("wallet_switchEthereumChain", [{ chainId: targetChainHex }]);
                    } catch (addError) {
                        console.error(addError);
                        toast.error(getRpcErrorMessage(addError));
                        throw addError;
                    }
                } else {
                    toast.error(getRpcErrorMessage(switchError));
                    throw switchError;
                }
            }
        }
    }, [targetBlockExplorerUrl, targetChainHex, targetChainId, targetChainName, targetRpcUrl]);

    useEffect(() => {
        const injectedProvider = getInjectedProvider();
        if (!injectedProvider) return;

        const browserProvider = new ethers.BrowserProvider(injectedProvider);
        setProvider(browserProvider);

        const syncWalletState = async () => {
            try {
                const accounts = await browserProvider.listAccounts();
                if (accounts.length > 0) {
                    await checkNetwork(browserProvider);
                    setAccount(accounts[0].address);
                    return;
                }
                setAccount(null);
            } catch (error) {
                console.error("Gagal menyinkronkan wallet", error);
            }
        };

        const handleAccountsChanged = (accounts: string[]) => {
            setAccount(accounts[0] || null);
        };

        const handleChainChanged = async () => {
            const nextProvider = new ethers.BrowserProvider(injectedProvider);
            setProvider(nextProvider);

            try {
                const accounts = await nextProvider.send("eth_accounts", []);
                if (accounts.length > 0) {
                    await checkNetwork(nextProvider);
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            } catch (error) {
                console.error("Gagal memperbarui chain wallet", error);
            }
        };

        syncWalletState();
        injectedProvider.on?.("accountsChanged", handleAccountsChanged);
        injectedProvider.on?.("chainChanged", handleChainChanged);

        return () => {
            injectedProvider.removeListener?.("accountsChanged", handleAccountsChanged);
            injectedProvider.removeListener?.("chainChanged", handleChainChanged);
        };
    }, [checkNetwork]);

    const connectWallet = async () => {
        const injectedProvider = getInjectedProvider();
        if (!provider || !injectedProvider) {
            toast.error("Silakan pasang MetaMask terlebih dahulu");
            return;
        }
        try {
            const accounts = await provider.send("eth_requestAccounts", []);
            await checkNetwork(provider);
            setAccount(accounts[0]);
        } catch (error) {
            console.error("Koneksi ditolak", error);
            toast.error(getRpcErrorMessage(error));
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
    };

    return (
        <WalletContext.Provider value={{ account, connectWallet, disconnectWallet, isConnected: !!account, provider }}>
            {children}
        </WalletContext.Provider>
    );
};
