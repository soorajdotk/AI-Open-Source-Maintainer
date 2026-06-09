import { ethers } from "ethers";
import { agentProcureAIAbi } from "./agentProcureAIAbi";

const CONTRACT =
  import.meta.env.VITE_AI_CONTRACT || "0xE1e16C44A50D2A83d69FA6fd540d3dF3EF0520e7";

export async function getAIContract() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No crypto wallet found");
  }
  const provider =
    new ethers.BrowserProvider(
      (window as any).ethereum
    );

  const signer =
    await provider.getSigner();

  return new ethers.Contract(
    CONTRACT,
    agentProcureAIAbi,
    signer
  );
}
