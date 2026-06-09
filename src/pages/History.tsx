import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { ProcurementRequest } from '../types/procurement';
import { SOMNIA_CHAIN_CONFIG } from '../contracts/agentProcure';

interface HistoryProps {
  requests: ProcurementRequest[];
}

export const History: React.FC<HistoryProps> = ({ requests }) => {
  const navigate = useNavigate();

  // Filter out completed requests that have evaluations
  const completedRequests = requests.filter(
    r => r.status === 'completed' && r.vendors && r.winnerId
  );

  const formatAddress = (address: string) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2.5">
          <HistoryIcon className="h-7 w-7 text-cyan-400" />
          Recommendation History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical log of audited vendor recommendations and their corresponding consensus proofs on the Somnia Testnet.
        </p>
      </div>

      {completedRequests.length === 0 ? (
        <Card className="border border-slate-900 border-dashed bg-slate-900/10 p-8 text-center max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-500">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-350">No recommendation history found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Analyze a procurement request using AI agents first to write outcomes to the chain.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')} 
            size="sm" 
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-full font-semibold px-4 cursor-pointer"
          >
            Go to Dashboard
          </Button>
        </Card>
      ) : (
        <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-3 pt-5 border-b border-slate-850 bg-gradient-to-r from-slate-950/20 to-transparent">
            <CardTitle className="text-sm font-bold text-slate-200">On-Chain Audit Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/60 border-b border-slate-850">
                  <TableRow>
                    <TableHead className="font-bold text-slate-400 font-mono text-[10px] uppercase w-[120px]">Request ID</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase w-[150px]">Product / Requirement</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase min-w-[200px]">AI Recommendation Result</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase w-[140px]">Date Saved</TableHead>
                    <TableHead className="font-bold text-slate-400 font-mono text-[10px] uppercase w-[180px]">Tx Hash</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRequests.map((req) => {
                    const winner = req.vendors?.find(v => v.id === req.winnerId);
                    const recommendationText = winner 
                      ? `${winner.name} (Score: ${winner.scores.overall}) - ${winner.reasoning}`
                      : "Analysis complete. Winner chosen.";

                    return (
                      <TableRow key={req.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                        <TableCell className="font-mono text-[11px] text-slate-400 truncate max-w-[120px]" title={req.id}>
                          {req.id}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-200 text-xs">
                          {req.productName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-350 line-clamp-2 pr-4 pt-4.5">
                          {recommendationText}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {new Date(req.timestamp || req.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {req.txHash ? (
                            <a
                              href={`${SOMNIA_CHAIN_CONFIG.blockExplorerUrls[0]}tx/${req.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{formatAddress(req.txHash)}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-500 italic">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => navigate(`/request/${req.id}/result`)}
                            title="View details"
                            className="p-1 hover:bg-slate-800 rounded-full text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
