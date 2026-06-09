import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, Bot, Cpu, GitCommit } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { checkStatus, getRecommendation } from '../services/recommendationService';
import type { ProcurementRequest, VendorData, AgentState } from '../types/procurement';
import { getRequestDetails } from '../services/procurementService';

interface AgentActivityProps {
  requests: ProcurementRequest[];
  saveRequestResult: (id: string, vendors: VendorData[], winnerId: string, agents: AgentState[], txHash: string) => void;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  saveRequestResult
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(true);
  const [agentRequestId, setAgentRequestId] = useState('');
  const [txHash, setTxHash] = useState('');
  const [statusLog, setStatusLog] = useState('Initializing connection...');

  useEffect(() => {
    const loadRequest = async () => {
      if (!id) return;
      try {
        const details = await getRequestDetails(Number(id));
        if (details) {
          setRequest(details);
        }
        
        const savedAgentId = localStorage.getItem("agentRequestId_" + id) || id;
        const savedTxHash = localStorage.getItem("analysis_tx_" + id) || "";
        
        setAgentRequestId(savedAgentId);
        setTxHash(savedTxHash);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id]);

  useEffect(() => {
    if (!id || !agentRequestId || !request) return;

    // If request is already completed on chain, redirect immediately
    if (request.status === 'completed') {
      setIsPending(false);
      navigate(`/request/${id}/result`);
      return;
    }

    let active = true;
    
    const pollStatus = async () => {
      try {
        setStatusLog('Polling Somnia agent node state...');
        const pending = await checkStatus(Number(agentRequestId));
        
        if (!active) return;
        
        if (pending) {
          setIsPending(true);
          setStatusLog('🟡 Waiting For Somnia Agent');
        } else {
          setIsPending(false);
          setStatusLog('🟢 Analysis Complete');
          
          // Fetch dynamic recommendation
          const recResult = await getRecommendation(Number(agentRequestId));
          
          // Store result dynamically
          localStorage.setItem("recommendation_" + agentRequestId, recResult.result);
          
          // Update local requests state
          const { winner } = parseRecommendation(recResult.result);
          saveRequestResult(
            request.id,
            [{
              id: 'winner-vendor',
              name: winner,
              price: 0,
              warranty: '',
              rating: 0,
              scores: { price: 0, quality: 0, reliability: 0, overall: 0 },
              reasoning: recResult.result
            }],
            'winner-vendor',
            [],
            txHash
          );

          // Automatically redirect to recommendation page after 1.5s
          setTimeout(() => {
            if (active) {
              navigate(`/request/${id}/result`);
            }
          }, 1500);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setStatusLog('Error polling agent status. Retrying...');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id, agentRequestId, request, txHash]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
        <p className="text-xs text-slate-500 font-mono">Querying request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-350">Request Not Found</h2>
        <p className="text-xs text-slate-500">Could not resolve requested ID on Somnia testnet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      {/* Title */}
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-black text-slate-100 flex items-center justify-center gap-2">
          <Bot className="h-7 w-7 text-cyan-400" />
          AI Analysis Running...
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Procurement ID: {request.id} | Agent ID: {agentRequestId}
        </p>
      </div>

      <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden p-8">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500"></div>

        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
          {/* Status animation wrapper */}
          <div className="relative flex items-center justify-center">
            {isPending ? (
              <>
                <div className="absolute h-24 w-24 rounded-full border border-violet-500/20 animate-ping"></div>
                <div className="absolute h-20 w-20 rounded-full border border-cyan-500/30 animate-pulse"></div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
              </>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="text-center space-y-2 max-w-sm">
            <div className={`font-mono text-sm font-bold tracking-wider py-1.5 px-4 rounded-full border inline-block ${
              isPending 
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/30 animate-pulse'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30'
            }`}>
              {statusLog}
            </div>
            
            <p className="text-[11px] text-slate-500 leading-normal">
              {isPending 
                ? "The Somnia LLM Agent is currently processing your manual scoring weights on-chain. Please stand by." 
                : "Inference completed successfully. Recommendations written to contract event ledger."
              }
            </p>
          </div>

          {/* Ledger logs */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 w-full font-mono text-xs text-slate-400 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Execution Node</span>
              <span className="text-slate-300">Somnia LLM Oracle V1</span>
            </div>
            <div className="h-[1px] bg-slate-900" />
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1"><GitCommit className="h-3.5 w-3.5" /> Network</span>
              <span className="text-emerald-400 font-bold">Somnia Shannon Testnet</span>
            </div>
            {txHash && (
              <>
                <div className="h-[1px] bg-slate-900" />
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-600 min-w-[70px]">Tx Hash</span>
                  <span className="text-slate-400 truncate max-w-[200px]" title={txHash}>{txHash}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function parseRecommendation(text: string) {
  let winner = "Winner Selected";
  let reason = text;
  
  const winnerMatch = text.match(/Winner:\s*([^\n\r]+)/i);
  if (winnerMatch) {
    winner = winnerMatch[1].trim();
  }
  
  const reasonMatch = text.match(/Reason(?:ing)?:\s*([\s\S]+)/i);
  if (reasonMatch) {
    reason = reasonMatch[1].trim();
  } else if (winnerMatch) {
    reason = text.replace(winnerMatch[0], "").trim();
  }
  
  return { winner, reason };
}
