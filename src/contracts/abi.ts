export const AGENT_PROCURE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "budget",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string[]",
        "name": "vendorUrls",
        "type": "string[]"
      }
    ],
    "name": "RequestSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "winner",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "overallScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reasoning",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "txHash",
        "type": "string"
      }
    ],
    "name": "ResultStored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "productName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "budget",
        "type": "uint256"
      },
      {
        "internalType": "string[]",
        "name": "vendorUrls",
        "type": "string[]"
      }
    ],
    "name": "submitRequest",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "winner",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "overallScore",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reasoning",
        "type": "string"
      }
    ],
    "name": "storeResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "name": "getRequest",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "productName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "budget",
            "type": "uint256"
          },
          {
            "internalType": "string[]",
            "name": "vendorUrls",
            "type": "string[]"
          },
          {
            "internalType": "string",
            "name": "winner",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "overallScore",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "reasoning",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isCompleted",
            "type": "bool"
          }
        ],
        "internalType": "struct AgentProcure.ProcurementDetails",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
