export const agentProcureAbi = [
  "function requestCounter() view returns(uint256)",

  "function submitRequest(string productName,uint256 budget,string[] vendorUrls)",

  "function getVendorUrls(uint256 requestId) view returns(string[])",

  "function requests(uint256) view returns(uint256 id,address requester,string productName,uint256 budget,bool processed)",

  "function evaluations(uint256) view returns(string vendorName,uint256 priceScore,uint256 qualityScore,uint256 reliabilityScore,uint256 overallScore,string recommendation)",

  "event ProcurementCreated(uint256 indexed requestId,address indexed requester,string productName)",

  "event EvaluationStored(uint256 indexed requestId,string vendorName,uint256 score)"
];
