import { ethers } from "ethers";
import { agentProcureAbi } from "./agentProcureAbi";

export const SOMNIA_CHAIN_CONFIG = {
  chainId: "0xc488", // 50312 in decimal
  chainName: "Somnia Shannon Testnet",
  rpcUrls: ["https://rpc.shannon.somnia.network"],
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  blockExplorerUrls: ["https://explorer.shannon.somnia.network/"],
};

const CONTRACT =
  import.meta.env.VITE_PROCURE_CONTRACT || "0x89271bb0b68d4979a59189271bb0b68d4979a591";

export const AGENT_PROCURE_CONTRACT_ADDRESS = CONTRACT;

export async function getProcureContract() {
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
    agentProcureAbi,
    signer
  );
}
