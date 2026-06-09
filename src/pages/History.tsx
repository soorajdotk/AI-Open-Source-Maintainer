import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, ArrowRight, ExternalLink, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { ProcurementRequest } from '../types/procurement';
import { getProcureContract, SOMNIA_CHAIN_CONFIG } from '../contracts/agentProcure';
import { getAIContract } from '../contracts/agentProcureAI';
import { parseRecommendation } from './AgentActivity';

interface HistoryProps {
  requests?: ProcurementRequest[];
}

interface HistoryItem {
  id: string;
  productName: string;
  winner: string;
  recommendation: string;
  timestamp: number;
  txHash: string;
}

export const History: React.FC<HistoryProps> = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryFromLogs = async () => {
      setLoading(true);
      try {
        setError(null);
        const procureContract = await getProcureContract();
        const aiContract = await getAIContract();

        const provider = procureContract.runner?.provider;
        let startBlock = 0;
        try {
          if (provider) {
            const currentBlock = await provider.getBlockNumber();
            startBlock = Math.max(0, currentBlock - 990);
          }
        } catch (err) {
          console.error("Failed to query block number for history start block", err);
        }

        // Fetch ProcurementCreated logs
        const createdFilter = procureContract.filters.ProcurementCreated();
        const createdEvents = await procureContract.queryFilter(createdFilter, startBlock, 'latest');

        // Fetch AnalysisCompleted logs
        const completedFilter = aiContract.filters.AnalysisCompleted();
        const completedEvents = await aiContract.queryFilter(completedFilter, startBlock, 'latest');

        const blockCache: { [blockNumber: number]: number } = {};

        const getTimestampForBlock = async (blockNumber: number): Promise<number> => {
          if (blockCache[blockNumber]) return blockCache[blockNumber];
          try {
            if (provider) {
              const block = await provider.getBlock(blockNumber);
              if (block) {
                blockCache[blockNumber] = block.timestamp * 1000;
                return blockCache[blockNumber];
              }
            }
          } catch (err) {
            console.error("Failed to query block timestamp:", err);
          }
          return Date.now();
        };

        const completedMap: { [requestId: string]: { recommendation: string; txHash: string; timestamp: number } } = {};

        for (const event of completedEvents) {
          if ('args' in event) {
            const reqId = event.args.requestId.toString();
            const recommendation = event.args.recommendation || "";
            const txHash = event.transactionHash;
            const timestamp = await getTimestampForBlock(event.blockNumber);
            
            completedMap[reqId] = {
              recommendation,
              txHash,
              timestamp
            };
          }
        }

        const items: HistoryItem[] = [];
        for (const event of createdEvents) {
          if ('args' in event) {
            const reqId = event.args.requestId.toString();
            const productName = event.args.productName;
            const completedInfo = completedMap[reqId];

            if (completedInfo) {
              const { winner, reason } = parseRecommendation(completedInfo.recommendation);
              items.push({
                id: reqId,
                productName,
                winner,
                recommendation: reason,
                timestamp: completedInfo.timestamp,
                txHash: completedInfo.txHash
              });
            }
          }
        }

        items.sort((a, b) => b.timestamp - a.timestamp);
        setHistoryItems(items);
      } catch (err: any) {
        console.error("Failed to query on-chain history logs:", err);
        const errStr = String(err.message || err);
        if (errStr.includes("BAD_DATA") || errStr.includes("0x") || errStr.includes("decode")) {
          setError("Contract not found at the configured address. Please ensure MetaMask is connected to Somnia Shannon Testnet (Chain ID 50312) and the contract address is correct in .env.");
        } else {
          setError("Failed to query logs from Somnia Network. Please verify your MetaMask connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryFromLogs();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
        <p className="text-xs text-slate-500 font-mono">Fetching dynamic history logs from Somnia network...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {error && (
        <div className="bg-rose-950/45 border border-rose-850/50 rounded-2xl p-4 text-rose-300 text-xs flex items-start gap-3 shadow-md max-w-5xl">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase text-[10px] tracking-wider text-rose-400 font-mono">Contract Connection Warning</span>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

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

      {historyItems.length === 0 ? (
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
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase w-[100px]">Winner</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase min-w-[200px]">AI Recommendation Reason</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase w-[140px]">Date Saved</TableHead>
                    <TableHead className="font-bold text-slate-400 font-mono text-[10px] uppercase w-[180px]">Tx Hash</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyItems.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                      <TableCell className="font-mono text-[11px] text-slate-400 truncate max-w-[120px]" title={item.id}>
                        {item.id}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-200 text-xs">
                        {item.productName}
                      </TableCell>
                      <TableCell className="font-bold text-cyan-400 text-xs">
                        {item.winner}
                      </TableCell>
                      <TableCell className="text-xs text-slate-355 line-clamp-2 pr-4 pt-4.5">
                        {item.recommendation}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {item.txHash ? (
                          <a
                            href={`${SOMNIA_CHAIN_CONFIG.blockExplorerUrls[0]}tx/${item.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{formatAddress(item.txHash)}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/request/${item.id}/result`)}
                          title="View details"
                          className="p-1 hover:bg-slate-800 rounded-full text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
