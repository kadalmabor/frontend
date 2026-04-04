export const SESSION_ALLOWLIST_ABI = [
    "function getSessionAllowedVoters(uint256 _sessionId) view returns (address[] memory)",
    "function setSessionAllowedVoters(uint256 _sessionId, address[] memory _voters)",
] as const;
