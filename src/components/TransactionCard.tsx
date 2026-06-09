import React from 'react';
import { ShieldCheck, ExternalLink, Activity, Network } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { SOMNIA_CHAIN_CONFIG } from '../contracts/agentProcure';

interface TransactionCardProps {
  txHash: string;
  blockNumber?: number | string;
  status?: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ 
  txHash, 
  blockNumber = "1409281",
  status = "Success"
}) => {
  return (
    <Card className="border border-slate-800 bg-slate-950/50 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      <CardContent className="p-4.5 space-y-3 font-mono text-xs text-slate-350">
        <div className="flex justify-between items-center pb-2 border-b border-slate-900">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-sans">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            L1 Block Confirmation
          </span>
          <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[9px] font-mono">
            {status}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center">
            <span className="text-slate-500 flex items-center gap-1 min-w-[120px]">
              <Network className="h-3.5 w-3.5" />
              Tx Hash:
            </span>
            <a
              href={`${SOMNIA_CHAIN_CONFIG.blockExplorerUrls[0]}tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer select-all truncate"
            >
              <span className="truncate max-w-[200px] sm:max-w-xs">{txHash}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>

          <div className="h-[1px] bg-slate-900"></div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Block Height:
            </span>
            <span className="text-slate-300 font-bold">#{blockNumber}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
