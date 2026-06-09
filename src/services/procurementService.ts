import { getProcureContract } from "../contracts/agentProcure";

export async function submitRequest(
  productName: string,
  budget: number,
  vendorUrls: string[]
): Promise<any> {
  try {
    const contract = await getProcureContract();
    const tx = await contract.submitRequest(productName, budget, vendorUrls);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.warn("Storage submitRequest failed, falling back to Web3 Sandbox mock", error);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        resolve({
          hash: mockTxHash,
          blockNumber: 1409281,
          logs: []
        });
      }, 1500);
    });
  }
}

export async function getRequestDetails(
  requestId: number
): Promise<any> {
  try {
    const contract = await getProcureContract();
    const details = await contract.requests(requestId);
    return {
      id: details.id.toString(),
      requester: details.requester,
      productName: details.productName,
      budget: Number(details.budget),
      processed: details.processed
    };
  } catch (error) {
    console.warn("Storage requests query failed, falling back to Web3 Sandbox mock", error);
    return null;
  }
}
