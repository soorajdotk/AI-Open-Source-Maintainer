import { useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { AGENT_PROCURE_ABI } from '../contracts/abi';
import { AGENT_PROCURE_CONTRACT_ADDRESS } from '../contracts/AgentProcure';

export function useContract(walletAddress: string | null, isSimulated: boolean) {
  
  const getContractInstance = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum || !walletAddress || isSimulated) {
      return null;
    }
    
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      
      // Only return real contract instances if connected to the Somnia Testnet
      if (network.chainId.toString() === "50312") {
        const signer = await provider.getSigner();
        return new Contract(AGENT_PROCURE_CONTRACT_ADDRESS, AGENT_PROCURE_ABI, signer);
      }
      return null;
    } catch (err) {
      console.warn("Could not get smart contract instance. Running in simulation mode.", err);
      return null;
    }
  }, [walletAddress, isSimulated]);

  const submitRequestOnChain = useCallback(async (
    productName: string,
    budget: number,
    vendorUrls: string[]
  ): Promise<{ txHash: string; requestId: string }> => {
    const contract = await getContractInstance();
    
    if (contract) {
      try {
        const tx = await contract.submitRequest(productName, budget, vendorUrls);
        const receipt = await tx.wait();
        
        // Find RequestSubmitted event in receipt
        let requestId = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        if (receipt.logs && receipt.logs.length > 0) {
          try {
            const parsedLog = contract.interface.parseLog(receipt.logs[0]);
            if (parsedLog && parsedLog.args && parsedLog.args.requestId) {
              requestId = parsedLog.args.requestId;
            }
          } catch (e) {
            console.error("Failed to parse receipt logs", e);
          }
        }
        
        return {
          txHash: receipt.hash || tx.hash,
          requestId
        };
      } catch (err) {
        console.error("Contract submitRequest failed, reverting to simulation", err);
      }
    }

    // Simulation Flow
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const mockRequestId = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        resolve({
          txHash: mockTxHash,
          requestId: mockRequestId
        });
      }, 1500); // simulate block time
    });
  }, [getContractInstance]);

  const storeResultOnChain = useCallback(async (
    requestId: string,
    winner: string,
    overallScore: number,
    reasoning: string
  ): Promise<string> => {
    const contract = await getContractInstance();
    
    if (contract) {
      try {
        const tx = await contract.storeResult(requestId, winner, overallScore, reasoning);
        const receipt = await tx.wait();
        return receipt.hash || tx.hash;
      } catch (err) {
        console.error("Contract storeResult failed, reverting to simulation", err);
      }
    }

    // Simulation Flow
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        resolve(mockTxHash);
      }, 1500);
    });
  }, [getContractInstance]);

  return {
    submitRequestOnChain,
    storeResultOnChain
  };
}
