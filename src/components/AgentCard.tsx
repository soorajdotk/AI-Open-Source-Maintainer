import React from 'react';
import { Bot, CheckCircle2, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import type { AgentState } from '../types/procurement';

interface AgentCardProps {
  agent: AgentState;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getAgentColor = () => {
    switch (agent.type) {
      case 'parser': return 'from-violet-500/20 to-indigo-500/5 border-violet-500/30 text-violet-400';
      case 'api': return 'from-cyan-500/20 to-teal-500/5 border-cyan-500/30 text-cyan-400';
      case 'llm': return 'from-fuchsia-500/20 to-pink-500/5 border-fuchsia-500/30 text-fuchsia-400';
      case 'blockchain': return 'from-amber-500/20 to-orange-500/5 border-amber-500/30 text-amber-400';
    }
  };

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'idle':
        return <Badge className="bg-slate-800 text-slate-400 border-none">Idle</Badge>;
      case 'running':
        return (
          <Badge className="bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 animate-pulse flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <Card className={`overflow-hidden border bg-slate-900/40 backdrop-blur-sm transition-all duration-300 ${
      agent.status === 'running' 
        ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
        : 'border-slate-800'
    }`}>
      {/* Background Gradient Accent */}
      <div className={`h-1 bg-gradient-to-r ${
        agent.type === 'parser' ? 'from-violet-500 to-indigo-500' :
        agent.type === 'api' ? 'from-cyan-500 to-teal-500' :
        agent.type === 'llm' ? 'from-fuchsia-500 to-pink-500' :
        'from-amber-500 to-orange-500'
      }`}></div>

      <CardHeader className="pb-3 pt-4 px-5 flex flex-row justify-between items-center space-y-0">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${getAgentColor()}`}>
            <Bot className="h-5.5 w-5.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-200">{agent.name}</CardTitle>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{agent.type} Agent</span>
          </div>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0 space-y-3">
        {/* Terminal/Log Window */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-900 font-mono text-[11px] leading-relaxed text-slate-300 relative shadow-inner">
          <div className="absolute top-2 right-3 text-[9px] text-slate-600 font-bold uppercase select-none">Agent stdout</div>
          
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
            {agent.status === 'idle' && (
              <span className="text-slate-500 font-semibold italic">// Standing by. Awaiting execution trigger...</span>
            )}
            
            {agent.status !== 'idle' && agent.output.split('\n').map((line, i) => {
              if (line.startsWith('>>') || line.startsWith('[')) {
                return <div key={i} className="text-cyan-400 font-bold">{line}</div>;
              } else if (line.startsWith('Success') || line.startsWith('Extracted') || line.startsWith('Found')) {
                return <div key={i} className="text-emerald-400 font-semibold">{line}</div>;
              } else if (line.startsWith('Error') || line.startsWith('Failed')) {
                return <div key={i} className="text-rose-400 font-semibold">{line}</div>;
              }
              return <div key={i} className="text-slate-300">{line}</div>;
            })}
          </div>
        </div>

        {/* Extracted Data Box if Completed */}
        {agent.status === 'completed' && agent.extractedData && Object.keys(agent.extractedData).length > 0 && (
          <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <FileText className="h-3 w-3 text-cyan-400" />
              Extracted Parameters
            </span>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(agent.extractedData).map(([key, val]) => (
                <div key={key} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 font-mono block capitalize">{key}</span>
                  <span className="text-xs font-semibold text-slate-200 font-mono truncate block">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
