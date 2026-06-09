import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Play, Award, Loader2, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import type { ProcurementRequest } from '../types/procurement';
import { analyzeVendor } from '../services/agentService';
import { getRequestDetails } from '../services/procurementService';
import { getAIContract } from '../contracts/agentProcureAI';
import { ethers } from 'ethers';

interface RequestDetailsProps {
  requests: ProcurementRequest[];
  updateRequestStatus: (id: string, status: ProcurementRequest['status']) => void;
  updateRequestRequestId?: (id: string, requestId: string) => void;
}

interface VendorMetrics {
  name: string;
  url: string;
  priceScore: number;
  qualityScore: number;
  reliabilityScore: number;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ 
  updateRequestStatus
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusLog, setStatusLog] = useState('');
  
  // State for manual scores
  const [vendorMetrics, setVendorMetrics] = useState<VendorMetrics[]>([]);

  const getVendorNameFromUrl = (url: string, index: number): string => {
    try {
      const hostname = new URL(url).hostname;
      let name = hostname.replace('www.', '');
      const parts = name.split('.');
      if (parts.length >= 2) {
        name = parts[parts.length - 2];
      }
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (e) {
      return `Vendor ${index + 1}`;
    }
  };

  const getDefaultScores = (name: string) => {
    const lname = name.toLowerCase();
    if (lname.includes('dell')) {
      return { price: 90, quality: 95, reliability: 93 };
    }
    if (lname.includes('hp')) {
      return { price: 84, quality: 90, reliability: 86 };
    }
    if (lname.includes('lenovo')) {
      return { price: 78, quality: 92, reliability: 90 };
    }
    return { price: 80, quality: 80, reliability: 80 };
  };

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const details = await getRequestDetails(Number(id));
      if (details) {
        setRequest(details);
        
        // Initialize score inputs dynamically
        const metrics = details.vendorUrls.map((url: string, idx: number) => {
          const name = getVendorNameFromUrl(url, idx);
          const scores = getDefaultScores(name);
          return {
            name,
            url,
            priceScore: scores.price,
            qualityScore: scores.quality,
            reliabilityScore: scores.reliability
          };
        });
        setVendorMetrics(metrics);
      }
    } catch (err) {
      console.error("Error loading request details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleScoreChange = (index: number, field: keyof VendorMetrics, value: number) => {
    setVendorMetrics(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleStartAnalysis = async () => {
    if (!request) return;
    setAnalyzing(true);
    setStatusLog('Constructing dynamic vendor comparison prompt...');

    // Construct the prompt dynamically from user inputs
    let promptContent = "";
    vendorMetrics.forEach(v => {
      promptContent += `${v.name}\n`;
      promptContent += `Price Score: ${v.priceScore}\n`;
      promptContent += `Quality Score: ${v.qualityScore}\n`;
      promptContent += `Reliability Score: ${v.reliabilityScore}\n\n`;
    });
    
    promptContent += "Choose the best vendor.\nReturn:\nWinner:\nReason:";

    try {
      setStatusLog('Sending transaction to Somnia LLM Agent...');
      const receipt = await analyzeVendor(promptContent);
      
      setStatusLog('Extracting agentRequestId...');
      const aiContract = await getAIContract();
      let agentRequestId = "";
      
      // Fallback 1: Interface parsing
      for (const log of receipt.logs) {
        try {
          const parsedLog = aiContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "AnalysisRequested") {
            agentRequestId = parsedLog.args.requestId.toString();
            break;
          }
        } catch (err) {
          // Ignore
        }
      }

      // Fallback 2: Direct topic matching
      if (!agentRequestId && receipt.logs) {
        const topicHash = ethers.id("AnalysisRequested(uint256)");
        for (const log of receipt.logs) {
          if (log.topics && log.topics[0] === topicHash) {
            if (log.topics[1]) {
              try {
                agentRequestId = BigInt(log.topics[1]).toString();
                break;
              } catch (e) {
                // Ignore
              }
            }
          }
        }
      }

      if (!agentRequestId) {
        throw new Error("Could not extract agentRequestId from event logs.");
      }

      // Store agentRequestId and analysis tx hash keyed by procurement requestId
      localStorage.setItem("agentRequestId_" + request.id, agentRequestId);
      localStorage.setItem("analysis_tx_" + request.id, receipt.hash || receipt.transactionHash);

      // Set global/local status to processing
      updateRequestStatus(request.id, 'processing');
      
      setStatusLog('Redirecting to timeline...');
      setTimeout(() => {
        setAnalyzing(false);
        navigate(`/request/${request.id}/agents`);
      }, 800);

    } catch (err) {
      console.error("AI Analysis trigger failed", err);
      setStatusLog('Transaction failed. Make sure wallet is connected.');
      setAnalyzing(false);
    }
  };

  const getStatusLabel = (status: ProcurementRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-950/40 text-amber-400 border border-amber-800/30 font-mono text-[10px] py-1 px-2.5">
            Awaiting Analysis
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 font-mono text-[10px] py-1 px-2.5 animate-pulse">
            AI Analysis Running...
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-mono text-[10px] py-1 px-2.5">
            On-Chain Resolved
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
        <p className="text-xs text-slate-500 font-mono">Querying Somnia blockchain data...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-350">Request Not Found</h2>
        <p className="text-xs text-slate-500">The requested procurement ID does not exist in on-chain records.</p>
        <Link to="/dashboard">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-500 rounded-full cursor-pointer">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Main Request Header */}
      <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500"></div>

        <CardHeader className="pb-5 pt-7 px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono">Request ID: {request.id}</span>
                {getStatusLabel(request.status)}
              </div>
              <CardTitle className="text-2xl font-black text-slate-100 mt-1.5">
                {request.productName}
              </CardTitle>
            </div>
            
            <div className="bg-slate-950/80 rounded-2xl px-5 py-3 border border-slate-900 flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Budget</span>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-mono">
                ${request.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-8">
          {/* Vendor URLs List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Vendor URLs</h3>
            <div className="space-y-2">
              {request.vendorUrls.map((url, i) => {
                const name = getVendorNameFromUrl(url, i);
                return (
                  <div key={i} className="flex items-center gap-2 text-slate-300 text-sm py-1.5 px-3 rounded-lg bg-slate-950/40 border border-slate-900">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-slate-200">{name}:</span>
                    <a href={url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-mono text-xs truncate">
                      {url}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vendor Evaluation Score Inputs */}
          {request.status !== 'completed' && (
            <div className="space-y-5 pt-4 border-t border-slate-800/80">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Vendor Evaluation Input</h3>
                <p className="text-[11px] text-slate-400">Since automatic page parsing is not integrated, please manually evaluate and specify the vendor metrics below before running LLM Analysis.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vendorMetrics.map((v, index) => (
                  <Card key={index} className="border border-slate-800 bg-slate-950/30">
                    <CardHeader className="py-3 px-4 border-b border-slate-900">
                      <CardTitle className="text-sm font-bold text-slate-200">{v.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Price Score</label>
                        <Input 
                          type="number"
                          value={v.priceScore}
                          onChange={(e) => handleScoreChange(index, 'priceScore', parseInt(e.target.value) || 0)}
                          className="bg-slate-950/80 border-slate-800 h-9 text-xs"
                          min="0"
                          max="100"
                          disabled={analyzing}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Quality Score</label>
                        <Input 
                          type="number"
                          value={v.qualityScore}
                          onChange={(e) => handleScoreChange(index, 'qualityScore', parseInt(e.target.value) || 0)}
                          className="bg-slate-950/80 border-slate-800 h-9 text-xs"
                          min="0"
                          max="100"
                          disabled={analyzing}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Reliability Score</label>
                        <Input 
                          type="number"
                          value={v.reliabilityScore}
                          onChange={(e) => handleScoreChange(index, 'reliabilityScore', parseInt(e.target.value) || 0)}
                          className="bg-slate-950/80 border-slate-800 h-9 text-xs"
                          min="0"
                          max="100"
                          disabled={analyzing}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action trigger footer */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-normal max-w-lg">
              <Cpu className="h-4.5 w-4.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>
                {request.status === 'completed' 
                  ? 'Evaluation for this request has completed. You can view the on-chain consensus details and reports.' 
                  : 'Start the autonomous Somnia agent pipeline to analyze vendor scores and construct overall rankings.'
                }
              </span>
            </div>

            {analyzing ? (
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-full border border-slate-800 text-xs font-mono text-cyan-400 min-w-[200px] justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>{statusLog}</span>
              </div>
            ) : request.status === 'completed' ? (
              <Button 
                onClick={() => navigate(`/request/${request.id}/result`)}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 h-11 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="h-4.5 w-4.5" />
                <span>View Recommendation</span>
              </Button>
            ) : (
              <Button 
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-6 py-2.5 h-11 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white text-transparent" />
                <span>Analyze Vendors</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
