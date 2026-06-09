import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Key, Cpu, Hash, Globe, Activity, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { ProcurementRequest } from '../types/procurement';
import { getRecommendation } from '../services/recommendationService';
import { getRequestDetails } from '../services/procurementService';
import { parseRecommendation } from './AgentActivity';

interface RecommendationProps {
  requests: ProcurementRequest[];
}

export const Recommendation: React.FC<RecommendationProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [recText, setRecText] = useState("");

  const agentRequestId = localStorage.getItem("agentRequestId_" + id) || id || "";
  const analysisTxHash = localStorage.getItem("analysis_tx_" + id) || "";
  const submitTxHash = localStorage.getItem("submit_tx_" + id) || "";

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const details = await getRequestDetails(Number(id));
        setRequest(details);

        const recData = await getRecommendation(Number(agentRequestId));
        setRecText(recData.result);
      } catch (err) {
        console.error("Failed to load recommendation:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, agentRequestId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Activity className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
        <p className="text-xs text-slate-500 font-mono">Fetching recommendation report from Somnia blockchain...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-350">Request Not Found</h2>
        <p className="text-xs text-slate-500">Could not resolve requested ID on Somnia testnet.</p>
        <Button onClick={() => navigate('/dashboard')} size="sm" className="bg-violet-600 hover:bg-violet-500 rounded-full cursor-pointer">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const { winner, reason } = parseRecommendation(recText);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Navigation */}
      <button 
        onClick={() => navigate(`/request/${request.id}`)} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Request Details
      </button>

      {/* Main Results Card */}
      <Card className="relative overflow-hidden border border-cyan-500/30 bg-slate-900/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400" />
        
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-800/80 bg-gradient-to-r from-cyan-950/20 to-violet-950/20">
          <CardTitle className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Evaluation Outcome
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Winner */}
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-900 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Winner</span>
            <div className="text-3xl font-black text-slate-100">{winner}</div>
          </div>

          {/* Reason */}
          <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-900 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Reason</span>
            <p className="text-sm text-slate-350 leading-relaxed font-medium">{reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Verification Details */}
      <Card className="border border-slate-850 bg-slate-900/40 backdrop-blur-md">
        <CardHeader className="pb-3 pt-5 border-b border-slate-900 bg-slate-950/20">
          <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Blockchain Verification
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-5 space-y-3.5 font-mono text-xs text-slate-300">
          <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-violet-400" />
              Request ID:
            </span>
            <span className="text-slate-200 font-bold">{request.id}</span>
          </div>
          
          <div className="h-[1px] bg-slate-850" />
          
          <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Agent Request ID:
            </span>
            <span className="text-slate-200 font-bold">{agentRequestId}</span>
          </div>
          
          <div className="h-[1px] bg-slate-850" />
          
          <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-emerald-400" />
              Transaction Hash:
            </span>
            <span className="text-cyan-400 break-all select-all font-mono">{analysisTxHash || submitTxHash || "0x"}</span>
          </div>
          
          <div className="h-[1px] bg-slate-850" />
          
          <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-violet-400" />
              Network:
            </span>
            <span className="text-emerald-400 font-bold">Somnia Shannon Testnet</span>
          </div>

          <div className="h-[1px] bg-slate-850" />
          
          <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Status:
            </span>
            <span className="text-emerald-400 font-bold">Completed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
