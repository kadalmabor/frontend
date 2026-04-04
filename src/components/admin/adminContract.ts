import { ethers } from "ethers";
import VotingArtifact from "../../contracts/VotingSystem.json";
import { SESSION_ALLOWLIST_ABI } from "./constants";

export const getAllowlistContract = (runner: ethers.ContractRunner) =>
    new ethers.Contract(
        process.env.NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS!,
        [...VotingArtifact.abi, ...SESSION_ALLOWLIST_ABI],
        runner
    );
