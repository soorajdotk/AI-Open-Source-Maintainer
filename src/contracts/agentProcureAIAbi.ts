export const agentProcureAIAbi = [
  "function analyzeVendors(string vendorPrompt) payable returns(uint256)",

  "function recommendations(uint256 requestId) view returns(string result,bool completed)",

  "function pendingRequests(uint256 requestId) view returns(bool)",

  "function getRequiredDeposit() view returns(uint256)",

  "event AnalysisRequested(uint256 indexed requestId)",

  "event AnalysisCompleted(uint256 indexed requestId,string recommendation)"
];
