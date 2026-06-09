import { getAIContract } from "../contracts/agentProcureAI";

export async function getRequiredDeposit(): Promise<bigint> {
  const contract = await getAIContract();
  return await contract.getRequiredDeposit();
}

export async function analyzeVendor(
  prompt: string
): Promise<any> {
  const contract = await getAIContract();
  const deposit = await contract.getRequiredDeposit();
  const tx = await contract.analyzeVendors(prompt, {
    value: deposit
  });
  const receipt = await tx.wait();
  return receipt;
}
