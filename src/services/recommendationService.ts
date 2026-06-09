import { getAIContract } from "../contracts/agentProcureAI";

export async function getRecommendation(
  requestId: number
): Promise<{ result: string; completed: boolean }> {
  const contract = await getAIContract();
  const data = await contract.recommendations(requestId);
  return {
    result: data.result,
    completed: data.completed
  };
}

export async function checkStatus(
  requestId: number
): Promise<boolean> {
  const contract = await getAIContract();
  return await contract.pendingRequests(requestId);
}
