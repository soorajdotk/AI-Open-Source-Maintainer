import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface WalletConnectProps {
  walletAddress: string | null;
  walletBalance: string;
  networkName: string;
  isConnected: boolean;
  isConnecting: boolean;
  isSimulated: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  walletAddress,
  walletBalance,
  networkName,
  isConnected,
  isConnecting,
  isSimulated,
  connectWallet,
  disconnectWallet,
}) => {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="flex items-center gap-3">
      {isConnected && walletAddress ? (
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-violet-500/20 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${isSimulated ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`}></span>
              {networkName}
            </span>
            <span className="text-xs font-mono font-medium text-slate-200">
              {formatAddress(walletAddress)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-slate-800"></div>

          <div className="flex flex-col items-start">
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Balance</span>
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              {walletBalance} STT
            </span>
          </div>

          <button
            onClick={disconnectWallet}
            title="Disconnect Wallet"
            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative overflow-hidden group bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm px-5 py-2 h-10 rounded-full border border-violet-400/30 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
        >
          {isConnecting ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Connect Wallet</span>
            </>
          )}
          <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </Button>
      )}
    </div>
  );
};
