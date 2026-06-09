import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutList, CheckCircle, Clock, Cpu, Loader2, Wallet, ArrowRight, Bot, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import type { ProcurementRequest } from '../types/procurement';
import { calculateDashboardMetrics } from '../services/dashboardService';
import { getAllRequests } from '../services/procurementService';
import { useWallet } from '../hooks/useWallet';

interface DashboardProps {
  requests?: ProcurementRequest[];
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractError, setContractError] = useState<string | null>(null);
  const { walletAddress } = useWallet();

  const loadRequests = async () => {
    try {
      setContractError(null);
      const data = await getAllRequests();
      setRequests(data);
    } catch (err: any) {
      console.error("Failed to load requests for dashboard:", err);
      const errStr = String(err.message || err);
      if (errStr.includes("BAD_DATA") || errStr.includes("0x") || errStr.includes("decode")) {
        setContractError("Contract not found at the configured address. Please verify that MetaMask is connected to Somnia Shannon Testnet (Chain ID 50312) and the contract address is correct in .env.");
      } else {
        setContractError("Failed to query Somnia blockchain data. Please verify your MetaMask network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const metrics = calculateDashboardMetrics(requests);

  const getStatusBadge = (status: ProcurementRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-950/40 text-amber-400 border border-amber-800/30 font-mono text-[10px]">Awaiting Agent Analysis</Badge>;
      case 'processing':
        return <Badge className="bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 font-mono text-[10px] animate-pulse">AI Analysis Running...</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-mono text-[10px]">On-Chain Resolved</Badge>;
    }
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return "Not Connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
        <p className="text-xs text-slate-500 font-mono">Loading dynamic procurement metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {contractError && (
        <div className="bg-rose-950/45 border border-rose-850/50 rounded-2xl p-4 text-rose-300 text-xs flex items-start gap-3 shadow-md max-w-5xl">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase text-[10px] tracking-wider text-rose-400 font-mono">Contract Connection Warning</span>
            <p className="leading-relaxed">{contractError}</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <LayoutList className="h-7 w-7 text-cyan-400" />
            Procurement Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your autonomous vendor evaluations, review logs, and monitor Somnia smart contract logs.
          </p>
        </div>

        <Link to="/create">
          <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-5 py-2.5 h-10 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all flex items-center gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            Create Request
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Total Requests',
            val: metrics.totalRequests,
            icon: <Cpu className="h-5 w-5 text-violet-400" />,
            bg: 'from-violet-500/10 to-transparent border-violet-500/10',
          },
          {
            title: 'Completed Analyses',
            val: metrics.completedAnalyses,
            icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
            bg: 'from-emerald-500/10 to-transparent border-emerald-500/10',
          },
          {
            title: 'Pending Analyses',
            val: metrics.pendingAnalyses,
            icon: <Clock className="h-5 w-5 text-amber-400 animate-pulse" />,
            bg: 'from-amber-500/10 to-transparent border-amber-500/10',
          },
          {
            title: 'Wallet Address',
            val: formatAddress(walletAddress),
            icon: <Wallet className="h-5 w-5 text-cyan-400" />,
            bg: 'from-cyan-500/10 to-transparent border-cyan-500/10',
            isAddress: true
          },
        ].map((stat, i) => (
          <Card key={i} className={`bg-gradient-to-br ${stat.bg} border bg-slate-900/40 backdrop-blur-sm shadow-sm`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1.5 overflow-hidden">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{stat.title}</span>
                <div className={`font-black text-slate-100 ${stat.isAddress ? 'text-lg font-mono truncate max-w-[150px]' : 'text-2xl'}`}>{stat.val}</div>
              </div>
              <div className="h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 flex-shrink-0">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests Listing Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200">Active Evaluations</h2>
        
        {metrics.totalRequests === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-slate-900 border-dashed max-w-xl mx-auto flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-800 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div className="space-y-1 px-4">
              <h3 className="text-sm font-bold text-slate-300">No requests submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Submit your first vendor evaluation request using our multi-agent framework to monitor outcomes.
              </p>
            </div>
            <Link to="/create">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white rounded-full font-semibold px-4 cursor-pointer">
                Create Request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card 
                key={req.id} 
                onClick={() => navigate(`/request/${req.id}`)}
                className="group border border-slate-800 bg-slate-900/40 hover:border-slate-700 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-2 pt-5 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-1">
                        {req.productName}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Request ID: {req.id}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-3.5">
                    {/* Budget & Vendors */}
                    <div className="flex justify-between items-center text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-900/60 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Budget Limit</span>
                        <span className="text-slate-200 font-bold">${req.budget.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Vendor Links</span>
                        <span className="text-slate-200 font-bold">{req.vendorUrls.length} Sources</span>
                      </div>
                    </div>

                    {/* Status Badge & Timestamp */}
                    <div className="flex justify-between items-center">
                      {getStatusBadge(req.status)}
                    </div>
                  </CardContent>
                </div>

                <div className="px-5 py-3 border-t border-slate-900 bg-slate-950/20 flex items-center justify-between text-xs text-cyan-400 group-hover:text-cyan-300 font-bold transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
