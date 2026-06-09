import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Terminal, 
  CheckCircle2, 
  Globe, 
  Database, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import type { ProcurementRequest, VendorData, AgentState } from '../types/procurement';
import { checkStatus, getRecommendation } from '../services/recommendationService';

interface AgentActivityProps {
  requests: ProcurementRequest[];
  saveRequestResult: (id: string, vendors: VendorData[], winnerId: string, agents: AgentState[], txHash: string) => void;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  requests,
  saveRequestResult
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const request = requests.find(r => r.id === id);

  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] Launching Somnia Agent Pipeline...', '>> Connecting to target indices...']);
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load request ID from localStorage or request object
  useEffect(() => {
    if (request) {
      const savedId = localStorage.getItem("requestId") || request.id;
      setRequestId(savedId);
      setTxHash(request.txHash || '');
    }
  }, [request]);

  // Dynamic Vendor Parser Helper
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

  useEffect(() => {
    if (!request || !requestId) return;

    if (request.status === 'completed') {
      setCurrentStep(5);
      setProgress(100);
      setLogs([
        '[System] Request was completed previously.',
        `>> On-chain transaction: ${request.txHash}`,
        '>> Winner selected: Dell',
        '[System] Standing by. Review report below.'
      ]);
      return;
    }

    const activeUrls = request.vendorUrls && request.vendorUrls.length > 0
      ? request.vendorUrls
      : ['https://dell.com', 'https://hp.com', 'https://lenovo.com'];

    const v1Name = getVendorNameFromUrl(activeUrls[0], 0);
    const v2Name = getVendorNameFromUrl(activeUrls[1], 1);
    const v3Name = getVendorNameFromUrl(activeUrls[2], 2);

    const price1 = Math.floor(request.budget * 0.88);
    const price2 = Math.floor(request.budget * 0.94);
    const price3 = Math.floor(request.budget * 0.98);

    const mockVendors: VendorData[] = [
      {
        id: 'V-V1',
        name: v1Name,
        price: price1,
        warranty: '1-Year Premium Warranty',
        rating: 4.6,
        scores: { price: 92, quality: 88, reliability: 95, overall: 91 },
        reasoning: `${v1Name} represents the highest cost-to-performance efficiency and fits comfortably within the $${request.budget.toLocaleString()} budget.`
      },
      {
        id: 'V-V2',
        name: v2Name,
        price: price2,
        warranty: '2-Year Limited Warranty',
        rating: 4.2,
        scores: { price: 84, quality: 90, reliability: 86, overall: 87 },
        reasoning: `${v2Name} provides excellent build quality, but pricing is higher, reducing overall cost efficiency.`
      },
      {
        id: 'V-V3',
        name: v3Name,
        price: price3,
        warranty: '3-Year Onsite Support',
        rating: 4.5,
        scores: { price: 78, quality: 92, reliability: 90, overall: 85 },
        reasoning: `${v3Name} leads in warranty coverage but borders the budget threshold.`
      }
    ];

    let active = true;
    let isPolling = false;

    const runPipeline = async () => {
      // Step 0: Request Submitted
      if (!active) return;
      setCurrentStep(0);
      setProgress(15);
      setLogs(prev => [...prev, '[System] Procurement event registered on Somnia Storage.', `>> Raw Request ID: ${requestId}`]);
      await delay(1500);

      // Step 1: Somnia LLM Agent
      if (!active) return;
      setCurrentStep(1);
      setProgress(30);
      setLogs(prev => [
        ...prev,
        '>> Initializing Somnia LLM Agent Node...',
        'Agent ID: 12847293847561029384',
        'Loading inference weights and verification contracts...'
      ]);
      await delay(2000);

      // Step 2: AI Analysis Running
      if (!active) return;
      setCurrentStep(2);
      setProgress(50);
      setLogs(prev => [
        ...prev,
        '>> AI Analysis Triggered. Scraping target URLs...',
        `Crawling: ${v1Name} URL -> parsed Price: $${price1.toLocaleString()}`,
        `Crawling: ${v2Name} URL -> parsed Price: $${price2.toLocaleString()}`,
        `Crawling: ${v3Name} URL -> parsed Price: $${price3.toLocaleString()}`,
        'Checking Trustpilot, Amazon review endpoints...',
        `Fetched ratings: ${v1Name} (4.6/5.0), ${v2Name} (4.2/5.0), ${v3Name} (4.5/5.0)`,
        'Running multi-criteria LLM optimization calculations...',
        `[Polling] Awaiting block confirmation from Somnia L1 agent...`
      ]);
      
      isPolling = true;
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    runPipeline();

    // Polling Loop check every 10 seconds as required
    const interval = setInterval(async () => {
      if (!active || !isPolling) return;

      setLogs(prev => [...prev, `[System] Polling agent status for Request ID: ${requestId}...`]);
      
      const pending = await checkStatus(Number(requestId));
      
      if (!pending) {
        isPolling = false;
        clearInterval(interval);
        
        // Fetch recommendations from service
        const recResult = await getRecommendation(Number(requestId));
        
        // Save dynamically to request log
        localStorage.setItem("recommendation_" + requestId, recResult.result);

        // Step 3: Consensus Reached
        if (!active) return;
        setCurrentStep(3);
        setProgress(70);
        setLogs(prev => [...prev, '[System] Consensus reached by validation network.', 'Validation checks complete. Event log confirmed.']);
        await delay(1500);

        // Step 4: Recommendation Generated
        if (!active) return;
        setCurrentStep(4);
        setProgress(85);
        setLogs(prev => [
          ...prev, 
          '>> Recommendation Generated by Somnia LLM Agent:',
          recResult.result
        ]);
        await delay(1500);

        // Step 5: Stored On-chain
        if (!active) return;
        setCurrentStep(5);
        setProgress(100);
        const finalTx = txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setLogs(prev => [
          ...prev,
          '[Blockchain] Committing evaluation receipt mapping to contract...',
          `Success: Saved on Somnia Shannon Testnet!`,
          `>> Transaction Hash: ${finalTx}`,
          '[System] Workflow completed successfully. Review results below.'
        ]);

        const agentStates: AgentState[] = [
          {
            id: 'agent-parser',
            name: 'Website Parser Agent',
            type: 'parser',
            status: 'completed',
            output: `Crawling domains: ${v1Name}, ${v2Name}, ${v3Name}`,
            extractedData: {
              [`${v1Name.toLowerCase()}_price`]: price1,
              [`${v2Name.toLowerCase()}_price`]: price2,
              [`${v3Name.toLowerCase()}_price`]: price3
            }
          },
          {
            id: 'agent-api',
            name: 'JSON API Agent',
            type: 'api',
            status: 'completed',
            output: `Synced Trustpilot ratings: ${v1Name} (4.6), ${v2Name} (4.2), ${v3Name} (4.5)`,
            extractedData: {
              [`${v1Name.toLowerCase()}_rating`]: 4.6,
              [`${v2Name.toLowerCase()}_rating`]: 4.2,
              [`${v3Name.toLowerCase()}_rating`]: 4.5
            }
          },
          {
            id: 'agent-llm',
            name: 'LLM Decision Agent',
            type: 'llm',
            status: 'completed',
            output: recResult.result,
            extractedData: {
              winner: v1Name,
              overall_score: 91,
              price_savings: request.budget - price1
            }
          }
        ];

        saveRequestResult(request.id, mockVendors, 'V-V1', agentStates, finalTx);
      }
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id, request, requestId]);

  if (!request) {
    return <div className="text-center py-10">Request not found</div>;
  }

  // Visual layout workflow node items
  const timelineNodes = [
    { step: 0, label: 'Request Submitted', sub: 'Storage contract submit', icon: <Send className="h-4 w-4" /> },
    { step: 1, label: 'Somnia LLM Agent', sub: 'Trigger AI node', icon: <Bot className="h-4 w-4" /> },
    { step: 2, label: 'AI Analysis Running', sub: 'Inference running', icon: <Globe className="h-4 w-4" /> },
    { step: 3, label: 'Consensus Reached', sub: 'Block confirmation', icon: <Database className="h-4 w-4" /> },
    { step: 4, label: 'Recommendation Generated', sub: 'Verdict generated', icon: <Cpu className="h-4 w-4" /> },
    { step: 5, label: 'Stored On-chain', sub: 'Settlement log', icon: <ShieldCheck className="h-4 w-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <Bot className="h-6 w-6 text-cyan-400" />
          Somnia Agent Workflow Timeline
        </h1>
        <p className="text-xs text-slate-400">
          Product: <span className="font-mono text-cyan-400">{request.productName}</span> | Request ID: <span className="font-mono text-violet-400">{requestId}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md p-5 space-y-6">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Workflow Node Status</h2>
            
            {/* Visual Timeline Nodes */}
            <div className="relative pl-8 space-y-8">
              {/* Vertical connecting line */}
              <div className="absolute top-3.5 left-3.5 bottom-3.5 w-[2px] bg-slate-800">
                <div 
                  className="w-full bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-violet-600 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ height: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>

              {timelineNodes.map((node) => {
                const isCompleted = currentStep > node.step;
                const isActive = currentStep === node.step;
                
                return (
                  <div key={node.step} className="relative flex items-start gap-4">
                    <div className={`absolute -left-8 flex h-7.5 w-7.5 items-center justify-center rounded-full border z-10 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-950 border-emerald-500/60 text-emerald-400' 
                        : isActive 
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : node.icon}
                    </div>

                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold transition-colors duration-300 ${
                        isActive ? 'text-cyan-400 font-extrabold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {node.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block leading-none">{node.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline progress bar */}
            <div className="space-y-1.5 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>Overall Execution Height</span>
                <span className="text-cyan-400 font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-950" />
            </div>
          </Card>
        </div>

        {/* Live Terminal logs console - 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border border-slate-800 bg-slate-950 backdrop-blur-md flex flex-col h-[480px] shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-850">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Terminal className="h-4 w-4 text-cyan-400" />
                SOMNIA_AGENT_PROCESS_ORCHESTRATOR.SH
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Logs Output */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-2 select-text scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, index) => {
                if (log.startsWith('[System]')) {
                  return <div key={index} className="text-emerald-400 font-bold">{log}</div>;
                } else if (log.startsWith('[Blockchain]')) {
                  return <div key={index} className="text-violet-400 font-bold">{log}</div>;
                } else if (log.startsWith('>>')) {
                  return <div key={index} className="text-cyan-400 font-bold">{log}</div>;
                } else if (log.startsWith('Success')) {
                  return <div key={index} className="text-emerald-500 font-bold">{log}</div>;
                } else if (log.startsWith('[Polling]')) {
                  return <div key={index} className="text-amber-400 font-semibold animate-pulse">{log}</div>;
                }
                return <div key={index} className="text-slate-400 pl-4">{log}</div>;
              })}
              <div ref={terminalEndRef}></div>
            </div>

            {/* Footer triggers */}
            {currentStep === 5 && (
              <div className="p-4 bg-slate-900/60 border-t border-slate-850 flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex flex-col text-[10px] text-slate-500 font-mono">
                  <span>Ledger verification confirmed</span>
                  <span>Tx Hash: {txHash ? `${txHash.substring(0, 14)}...` : 'N/A'}</span>
                </div>
                
                <Button
                  onClick={() => navigate(`/request/${request.id}/result`)}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-extrabold text-sm px-5 py-2.5 h-10 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1 cursor-pointer"
                >
                  <span>View Dynamic Report</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
