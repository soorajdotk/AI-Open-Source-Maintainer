import { getProcureContract } from "../contracts/agentProcure";
import type { ProcurementRequest, VendorData } from "../types/procurement";

export async function submitRequest(
  productName: string,
  budget: number,
  vendorUrls: string[]
): Promise<any> {
  const contract = await getProcureContract();
  const tx = await contract.submitRequest(productName, budget, vendorUrls);
  const receipt = await tx.wait();
  return receipt;
}

export async function getRequestDetails(
  requestId: number
): Promise<ProcurementRequest | null> {
  try {
    const contract = await getProcureContract();
    const details = await contract.requests(requestId);
    
    if (details.id.toString() === "0" || details.requester === "0x0000000000000000000000000000000000000000") {
      return null;
    }
    
    const urls = await contract.getVendorUrls(requestId);
    
    let vendors: VendorData[] = [];
    let winnerId: string | undefined = undefined;
    if (details.processed) {
      try {
        const evalData = await contract.evaluations(requestId);
        if (evalData.vendorName) {
          winnerId = "winner-eval";
          vendors = [{
            id: "winner-eval",
            name: evalData.vendorName,
            price: 0,
            warranty: "",
            rating: 0,
            scores: {
              price: Number(evalData.priceScore),
              quality: Number(evalData.qualityScore),
              reliability: Number(evalData.reliabilityScore),
              overall: Number(evalData.overallScore)
            },
            reasoning: evalData.recommendation
          }];
        }
      } catch (e) {
        console.warn(`Failed to fetch evaluations for request ${requestId}`, e);
      }
    }
    
    return {
      id: details.id.toString(),
      productName: details.productName,
      budget: Number(details.budget),
      vendorUrls: urls,
      status: (details.processed ? 'completed' : 'pending') as 'completed' | 'pending' | 'processing',
      createdAt: Date.now(),
      vendors: vendors.length > 0 ? vendors : undefined,
      winnerId: winnerId,
      txHash: localStorage.getItem("submit_tx_" + requestId) || undefined,
      timestamp: Date.now()
    } as ProcurementRequest;
  } catch (error) {
    console.error("Failed to query request details:", error);
    throw error;
  }
}

export async function getAllRequests(): Promise<ProcurementRequest[]> {
  try {
    const contract = await getProcureContract();
    const counter = await contract.requestCounter();
    const limit = Number(counter);
    
    const promises: Promise<ProcurementRequest | null>[] = [];
    for (let i = 1; i <= limit; i++) {
      promises.push(
        (async (): Promise<ProcurementRequest | null> => {
          try {
            const req = await contract.requests(i);
            if (req.id.toString() === "0" || req.requester === "0x0000000000000000000000000000000000000000") {
              return null;
            }
            
            const urls = await contract.getVendorUrls(i);
            
            let vendors: VendorData[] = [];
            let winnerId: string | undefined = undefined;
            if (req.processed) {
              try {
                const evalData = await contract.evaluations(i);
                if (evalData.vendorName) {
                  winnerId = "winner-eval";
                  vendors = [{
                    id: "winner-eval",
                    name: evalData.vendorName,
                    price: 0,
                    warranty: "",
                    rating: 0,
                    scores: {
                      price: Number(evalData.priceScore),
                      quality: Number(evalData.qualityScore),
                      reliability: Number(evalData.reliabilityScore),
                      overall: Number(evalData.overallScore)
                    },
                    reasoning: evalData.recommendation
                  }];
                }
              } catch (e) {
                console.warn(`Failed to fetch evaluations for request ${i}`, e);
              }
            }

            return {
              id: i.toString(),
              productName: req.productName,
              budget: Number(req.budget),
              vendorUrls: urls,
              status: (req.processed ? 'completed' : 'pending') as 'completed' | 'pending' | 'processing',
              createdAt: Date.now(),
              vendors: vendors.length > 0 ? vendors : undefined,
              winnerId: winnerId,
              txHash: localStorage.getItem("submit_tx_" + i) || undefined,
              timestamp: Date.now()
            } as ProcurementRequest;
          } catch (e) {
            console.error(`Failed to fetch request ${i}`, e);
            return null;
          }
        })()
      );
    }
    
    const results = await Promise.all(promises);
    return results.filter((r): r is ProcurementRequest => r !== null);
  } catch (error) {
    console.error("Failed to query all requests from chain:", error);
    throw error;
  }
}
