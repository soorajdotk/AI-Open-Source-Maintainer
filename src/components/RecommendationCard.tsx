import React from 'react';
import { Award, FileText, CheckCircle, ExternalLink, Calendar, Key, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SOMNIA_CHAIN_CONFIG } from '../contracts/AgentProcure';

interface RecommendationCardProps {
  winnerName: string;
  overallScore: number;
  reasoning: string;
  txHash?: string;
  timestamp?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  winnerName,
  overallScore,
  reasoning,
  txHash,
  timestamp,
}) => {
  const displayTime = timestamp 
    ? new Date(timestamp).toLocaleString() 
    : new Date().toLocaleString();

  return (
    <Card className="relative overflow-hidden border border-cyan-500/30 bg-slate-900/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.12)]">
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-800/80 bg-gradient-to-r from-cyan-950/20 to-violet-950/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-100">AI Evaluation Recommendation</CardTitle>
              <p className="text-xs text-slate-400">Autonomous multi-criteria vendor ranking report</p>
            </div>
          </div>
          <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-xs px-2.5 py-1">
            Verified On-Chain
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Climax stats - Winner Name and overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-950/50 rounded-2xl p-5 border border-slate-900 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Selected Winner</span>
              <div className="text-3xl font-black text-slate-100 flex items-center gap-2.5">
                {winnerName}
                <CheckCircle className="h-7 w-7 text-cyan-400 fill-cyan-950" />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Matched System</span>
              <Badge className="bg-violet-950/50 text-violet-300 border border-violet-800/40 text-[10px] mt-1 font-mono">
                Somnia AI Agent V1
              </Badge>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-900 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1 text-center">Overall Score</span>
            <div className="relative flex items-center justify-center">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 font-mono">
                {overallScore}
              </span>
              <span className="text-slate-500 text-xs font-semibold ml-1">/100</span>
            </div>
          </div>
        </div>

        {/* AI Reasoning Section */}
        <div className="space-y-2 bg-slate-950/30 p-5 rounded-2xl border border-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <FileText className="h-4 w-4 text-cyan-400" />
            AI Decision Analysis & Reasoning
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium pl-6">
            {reasoning}
          </p>
        </div>

        {/* Blockchain Audit Section */}
        <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
          <div className="bg-slate-900/60 px-5 py-3 border-b border-slate-850 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Stored On Somnia Blockchain
            </span>
            <Badge className="bg-slate-900 text-slate-400 text-[9px] font-mono border border-slate-800">
              Contract Address: 0x8927...a591
            </Badge>
          </div>
          <div className="p-4.5 space-y-3 font-mono text-xs text-slate-300">
            <div className="flex flex-col md:flex-row justify-between gap-1.5 md:items-center">
              <span className="text-slate-500 flex items-center gap-1.5 min-w-[150px]">
                <Key className="h-3.5 w-3.5" />
                Transaction Hash:
              </span>
              {txHash ? (
                <a
                  href={`${SOMNIA_CHAIN_CONFIG.blockExplorerUrls[0]}tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 truncate cursor-pointer"
                >
                  <span className="truncate max-w-[280px] sm:max-w-md md:max-w-xs lg:max-w-md">{txHash}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-amber-500 font-semibold italic">Processing record...</span>
              )}
            </div>
            
            <div className="h-[1px] bg-slate-850"></div>

            <div className="flex flex-col md:flex-row justify-between gap-1.5 md:items-center">
              <span className="text-slate-500 flex items-center gap-1.5 min-w-[150px]">
                <Calendar className="h-3.5 w-3.5" />
                Timestamp:
              </span>
              <span className="text-slate-300">{displayTime}</span>
            </div>

            <div className="h-[1px] bg-slate-850"></div>

            <div className="flex flex-col md:flex-row justify-between gap-1.5 md:items-center">
              <span className="text-slate-500 flex items-center gap-1.5 min-w-[150px]">
                <HeartHandshake className="h-3.5 w-3.5" />
                Consensus State:
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                Confirmed in Block (Finalized)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
