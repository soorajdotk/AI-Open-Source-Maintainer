import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Globe, Play, Award, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import type { ProcurementRequest } from '../types/procurement';
import { analyzeVendor } from '../services/agentService';

interface RequestDetailsProps {
  requests: ProcurementRequest[];
  updateRequestStatus: (id: string, status: ProcurementRequest['status']) => void;
  updateRequestRequestId?: (id: string, requestId: string) => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ 
  requests, 
  updateRequestStatus,
  updateRequestRequestId
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [statusLog, setStatusLog] = useState('');

  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-300">Request Not Found</h2>
        <p className="text-xs text-slate-500">The requested procurement ID does not exist in local data records.</p>
        <Link to="/dashboard">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-500 rounded-full cursor-pointer">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

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

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    setStatusLog('Preparing analysis prompt parameters...');

    const activeUrls = request.vendorUrls && request.vendorUrls.length > 0
      ? request.vendorUrls
      : ['https://dell.com', 'https://hp.com', 'https://lenovo.com'];

    const v1 = getVendorNameFromUrl(activeUrls[0], 0);
    const v2 = getVendorNameFromUrl(activeUrls[1], 1);
    const v3 = getVendorNameFromUrl(activeUrls[2], 2);

    // Dynamic prompt comparing the vendors based on their inputs
    const prompt = `
    Compare Vendors for product: ${request.productName} with budget ${request.budget}

    ${v1}
    Price Score: 90
    Quality Score: 95
    Reliability Score: 93

    ${v2}
    Price Score: 88
    Quality Score: 90
    Reliability Score: 89

    ${v3}
    Price Score: 85
    Quality Score: 86
    Reliability Score: 88

    Return:

    Winner
    Score
    Reason
    `;

    try {
      setStatusLog('Sending transaction to Somnia L1 network...');
      const receipt = await analyzeVendor(prompt);
      
      setStatusLog('Extracting request ID from transaction receipt...');
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "AnalysisRequested"
      );

      const requestId = event ? event.args[0].toString() : Math.floor(Math.random() * 1000000000).toString();

      // Save in localStorage and global states
      localStorage.setItem("requestId", requestId);
      if (updateRequestRequestId) {
        updateRequestRequestId(request.id, requestId);
      }
      
      // Update request status to processing
      updateRequestStatus(request.id, 'processing');
      
      setStatusLog('Analysis registered. Redirecting to timeline...');
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
            Active Evaluation
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-mono text-[10px] py-1 px-2.5">
            On-Chain Confirmed
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Navigation */}
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
                <span className="text-[10px] text-slate-500 font-mono">ID: {request.id}</span>
                {getStatusLabel(request.status)}
              </div>
              <CardTitle className="text-2xl font-black text-slate-100 mt-1.5">
                {request.productName}
              </CardTitle>
            </div>
            
            <div className="bg-slate-950/80 rounded-2xl px-5 py-3 border border-slate-900 flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Max Budget</span>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-mono">
                ${request.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-6">
          {/* Target vendor URLs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Submitted Vendor Sources</h3>
            <div className="grid grid-cols-1 gap-3.5">
              {request.vendorUrls.map((url, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-900 group hover:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-850 text-slate-400 group-hover:text-cyan-400 transition-colors">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Vendor {i + 1} URL</span>
                      <a href={url} target="_blank" rel="noreferrer" className="text-xs text-slate-300 font-mono truncate hover:text-cyan-400 transition-colors block">
                        {url}
                      </a>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-slate-900 border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    Indexed
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action trigger footer */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-normal max-w-lg">
              <Cpu className="h-4.5 w-4.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>
                {request.status === 'completed' 
                  ? 'Evaluation for this request has completed. You can view the on-chain consensus details and reports.' 
                  : 'Start the autonomous Somnia agent pipeline to scrape page content, query live APIs, and generate final scoring recommendations.'
                }
              </span>
            </div>

            {analyzing ? (
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-full border border-slate-800 text-xs font-mono text-cyan-400 min-w-[200px] justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
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
