/**
 * Block explorer links for transaction hashes (env first, then chain fallbacks).
 */
export function getBlockExplorerTxUrl(txHash: string, chainId?: bigint | number | null): string {
    const base = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL;
    if (base && base.trim()) {
        return `${base.replace(/\/$/, "")}/tx/${txHash}`;
    }
    const id = chainId !== undefined && chainId !== null ? BigInt(chainId) : null;
    if (id === 11155111n) return `https://sepolia.etherscan.io/tx/${txHash}`;
    if (id === 80002n) return `https://amoy.polygonscan.com/tx/${txHash}`;
    if (id === 31337n) return `https://etherscan.io/tx/${txHash}`;
    return `https://amoy.polygonscan.com/tx/${txHash}`;
}
