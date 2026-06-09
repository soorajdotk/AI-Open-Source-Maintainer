import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { SOMNIA_CHAIN_CONFIG } from '../contracts/AgentProcure';

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.0");
  const [networkName, setNetworkName] = useState<string>("Disconnected");
  const [chainId, setChainId] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Check storage for persisted wallet connection status
  useEffect(() => {
    const wasConnected = localStorage.getItem('wallet_connected') === 'true';
    const wasSimulated = localStorage.getItem('wallet_simulated') === 'true';

    if (wasConnected) {
      if (wasSimulated) {
        // Restore simulation
        setWalletAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
        setWalletBalance("250.75");
        setNetworkName("Somnia Testnet (Simulated)");
        setChainId("50312");
        setIsConnected(true);
        setIsSimulated(true);
      } else {
        // Try to reconnect with ethers
        checkMetaMaskConnection();
      }
    }
  }, []);

  const checkMetaMaskConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balance = await provider.getBalance(address);
          const network = await provider.getNetwork();
          
          setWalletAddress(address);
          setWalletBalance(parseFloat(formatEther(balance)).toFixed(4));
          setChainId(network.chainId.toString());
          setNetworkName(network.chainId.toString() === "50312" ? "Somnia Shannon Testnet" : "Unknown Network");
          setIsConnected(true);
          setIsSimulated(false);
          
          localStorage.setItem('wallet_connected', 'true');
          localStorage.setItem('wallet_simulated', 'false');
        }
      } catch (err) {
        console.error("Failed to check MetaMask connection", err);
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(ethereum);
        
        // Request accounts
        await provider.send("eth_requestAccounts", []);
        
        // Check Network
        const network = await provider.getNetwork();
        let currentChainId = network.chainId.toString();

        // Switch to Somnia if not there
        if (currentChainId !== "50312") {
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SOMNIA_CHAIN_CONFIG.chainId }],
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: SOMNIA_CHAIN_CONFIG.chainId,
                      chainName: SOMNIA_CHAIN_CONFIG.chainName,
                      rpcUrls: SOMNIA_CHAIN_CONFIG.rpcUrls,
                      nativeCurrency: SOMNIA_CHAIN_CONFIG.nativeCurrency,
                      blockExplorerUrls: SOMNIA_CHAIN_CONFIG.blockExplorerUrls,
                    },
                  ],
                });
              } catch (addError) {
                console.error("Error adding Somnia network", addError);
              }
            } else {
              console.error("Error switching to Somnia network", switchError);
            }
          }
        }

        // Recheck network and balance after potential switch
        const finalNetwork = await provider.getNetwork();
        const finalAddress = await (await provider.getSigner()).getAddress();
        const balance = await provider.getBalance(finalAddress);

        setWalletAddress(finalAddress);
        setWalletBalance(parseFloat(formatEther(balance)).toFixed(4));
        setChainId(finalNetwork.chainId.toString());
        setNetworkName(finalNetwork.chainId.toString() === "50312" ? "Somnia Shannon Testnet" : "Connected Network");
        setIsConnected(true);
        setIsSimulated(false);

        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_simulated', 'false');
      } catch (error) {
        console.error("MetaMask connection failed, falling back to simulation", error);
        triggerSimulation();
      } finally {
        setIsConnecting(false);
      }
    } else {
      // MetaMask not detected - trigger simulation mode
      setTimeout(() => {
        triggerSimulation();
        setIsConnecting(false);
      }, 800);
    }
  };

  const triggerSimulation = () => {
    setWalletAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    setWalletBalance("250.75");
    setNetworkName("Somnia Testnet (Simulated)");
    setChainId("50312");
    setIsConnected(true);
    setIsSimulated(true);

    localStorage.setItem('wallet_connected', 'true');
    localStorage.setItem('wallet_simulated', 'true');
  };

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setWalletBalance("0.0");
    setNetworkName("Disconnected");
    setChainId("");
    setIsConnected(false);
    setIsSimulated(false);

    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_simulated');
  }, []);

  // Monitor network/account changes if ethereum is active
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (ethereum && ethereum.on && !isSimulated) {
      const handleAccountsChange = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkMetaMaskConnection();
        }
      };

      const handleChainChange = () => {
        checkMetaMaskConnection();
      };

      ethereum.on('accountsChanged', handleAccountsChange);
      ethereum.on('chainChanged', handleChainChange);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChange);
          ethereum.removeListener('chainChanged', handleChainChange);
        }
      };
    }
  }, [isSimulated, disconnectWallet]);

  return {
    walletAddress,
    walletBalance,
    networkName,
    chainId,
    isConnected,
    isConnecting,
    isSimulated,
    connectWallet,
    disconnectWallet
  };
}
