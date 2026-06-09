import React from 'react';
import { Bot, Cpu, Hash, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AgentStatusCardProps {
  requestId: string | number;
  status: boolean; // true = Processing, false = Completed
}

export const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ requestId, status }) => {
  return (
    <Card className="border border-violet-500/20 bg-slate-900/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-violet-500/35">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
      
      <CardHeader className="pb-3 pt-5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-950/40 border border-violet-800/30 text-violet-400">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-200">Somnia LLM Agent</CardTitle>
            <span className="text-[9px] text-slate-500 font-mono block">Node ID: 12847293847561029384</span>
          </div>
        </div>

        {status ? (
          <Badge className="bg-cyan-950/40 text-cyan-400 border border-cyan-800/30 font-mono text-[9px] px-2 py-0.5 animate-pulse flex items-center gap-1">
            <Clock className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        ) : (
          <Badge className="bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-mono text-[9px] px-2 py-0.5 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-5 pt-1">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-violet-400" />
              Request ID:
            </span>
            <span className="text-slate-200 font-bold font-mono text-right truncate max-w-[160px]" title={String(requestId)}>
              {requestId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Execution Layer:
            </span>
            <span className="text-slate-300 font-semibold">Somnia Inference V1</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 leading-normal pl-1">
          {status 
            ? "The Somnia LLM Agent is currently executing inference logic and checking cross-vendor ratings."
            : "Inference completed successfully. Recommendation stored in the contract event log."
          }
        </div>
      </CardContent>
    </Card>
  );
};
