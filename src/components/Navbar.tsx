import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, LayoutDashboard, PlusCircle, Home } from 'lucide-react';
import { WalletConnect } from './WalletConnect';

interface NavbarProps {
  walletAddress: string | null;
  walletBalance: string;
  networkName: string;
  isConnected: boolean;
  isConnecting: boolean;
  isSimulated: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletAddress,
  walletBalance,
  networkName,
  isConnected,
  isConnecting,
  isSimulated,
  connectWallet,
  disconnectWallet,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return `relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-300 ${
      active 
        ? 'text-cyan-400 font-bold' 
        : 'text-slate-400 hover:text-slate-200'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform duration-300">
            <Cpu className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
              AgentProcure AI
            </span>
            <span className="text-[10px] text-slate-500 font-semibold leading-none tracking-wide -mt-0.5">
              Somnia Autonomous Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className={linkClass('/')}>
            <Home className="h-4 w-4" />
            <span>Home</span>
            {isActive('/') && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            )}
          </Link>
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
            {isActive('/dashboard') && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            )}
          </Link>
          <Link to="/create" className={linkClass('/create')}>
            <PlusCircle className="h-4 w-4" />
            <span>Create Request</span>
            {isActive('/create') && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            )}
          </Link>
        </nav>

        {/* Wallet Connect Widget */}
        <WalletConnect
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          networkName={networkName}
          isConnected={isConnected}
          isSimulated={isSimulated}
          isConnecting={isConnecting}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />
      </div>
    </header>
  );
};
