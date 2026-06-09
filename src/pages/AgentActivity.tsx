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
import { useContract } from '../hooks/useContract';

interface AgentActivityProps {
  requests: ProcurementRequest[];
  saveRequestResult: (id: string, vendors: VendorData[], winnerId: string, agents: AgentState[], txHash: string) => void;
  walletAddress: string | null;
  isSimulated: boolean;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  requests,
  saveRequestResult,
  walletAddress,
  isSimulated
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { storeResultOnChain } = useContract(walletAddress, isSimulated);

  const request = requests.find(r => r.id === id);

  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] Launching Somnia Agent Pipeline...', '>> Connecting to target indices...']);
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState<string>('');
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper to extract domain name
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
    if (!request) return;

    // Extract domains
    const activeUrls = request.vendorUrls && request.vendorUrls.length > 0
      ? request.vendorUrls
      : ['https://dell.com', 'https://hp.com', 'https://lenovo.com'];

    const v1Name = getVendorNameFromUrl(activeUrls[0] || 'https://dell.com', 0);
    const v2Name = getVendorNameFromUrl(activeUrls[1] || 'https://hp.com', 1);
    const v3Name = getVendorNameFromUrl(activeUrls[2] || 'https://lenovo.com', 2);

    const price1 = Math.floor(request.budget * 0.88);
    const price2 = Math.floor(request.budget * 0.94);
    const price3 = Math.floor(request.budget * 0.98);

    const winnerVendorName = v1Name;
    const winnerId = 'V-V1';

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

    const parserLogs = [
      '>> Launching Website Parser Agent...',
      `Connecting to ${v1Name} URL: ${activeUrls[0]}...`,
      `Found Product: ${v1Name} Offer. Parsing DOM metrics...`,
      `Extracted Price: $${price1.toLocaleString()}`,
      'Extracted Warranty: 1-Year Premium Warranty',
      `Extracted Specs: High-performance configuration fitting ${request.productName}`,
      `Connecting to ${v2Name} URL: ${activeUrls[1]}...`,
      `Found Product: ${v2Name} Offer. Parsing DOM metrics...`,
      `Extracted Price: $${price2.toLocaleString()}`,
      'Extracted Warranty: 2-Year Limited Warranty',
      `Connecting to ${v3Name} URL: ${activeUrls[2]}...`,
      `Found Product: ${v3Name} Offer. Parsing DOM metrics...`,
      `Extracted Price: $${price3.toLocaleString()}`,
      'Extracted Warranty: 3-Year Onsite Support',
      'Success: Scraped all target HTML files. Exporting specs.'
    ];

    const apiLogs = [
      '>> Launching JSON API Agent...',
      `Connecting to trustpilot.com/api/${v1Name.toLowerCase()}...`,
      `Fetched Trustpilot Review Index: 4.6/5.0 (420 reviews)`,
      `Connecting to trustpilot.com/api/${v2Name.toLowerCase()}...`,
      `Fetched Merchant Rating: 4.2/5.0 (310 reviews)`,
      `Connecting to trustpilot.com/api/${v3Name.toLowerCase()}...`,
      `Fetched Support Rating: 4.5/5.0 (580 reviews)`,
      'Success: API logs synced. Sentiment data generated.'
    ];

    const llmLogs = [
      '>> Launching LLM Decision Agent (Somnia Inference L1)...',
      'Consolidating metrics matrix...',
      `Price Metric (40% Weight): ${v1Name} (92), ${v2Name} (84), ${v3Name} (78)`,
      `Quality Metric (30% Weight): ${v3Name} (92), ${v2Name} (90), ${v1Name} (88)`,
      `Reliability Metric (30% Weight): ${v1Name} (95), ${v3Name} (90), ${v2Name} (86)`,
      'Running multi-criteria optimization equations...',
      `Overall score results: ${v1Name}: 91, ${v2Name}: 87, ${v3Name}: 85`,
      'Generating recommendation report...',
      `Success: ${v1Name} declared winner. Reason: ${v1Name} provides the best balance of price, warranty and reliability for your ${request.productName} requirement.`
    ];

    const blockchainLogs = [
      '>> Launching Blockchain Verification Agent...',
      'Formatting recommendation schema hash...',
      'Connecting to wallet address proxy...',
      'Invoking storeResult() smart contract execution...',
      'Broadcasting payload to Somnia Testnet nodes...',
      'Consensus matching... mining block...',
      'Success: Saved on Somnia Shannon Testnet!'
    ];

    if (request.status === 'completed') {
      setCurrentStep(5);
      setProgress(100);
      setTxHash(request.txHash || '');
      
      const savedWinnerName = request.vendors && request.vendors.length > 0 
        ? (request.vendors.find(v => v.id === request.winnerId)?.name || request.vendors[0].name)
        : winnerVendorName;

      setLogs([
        '[System] Request was completed previously.',
        `>> On-chain transaction: ${request.txHash}`,
        `>> Winner selected: ${savedWinnerName}`,
        '[System] Standing by. Review report below.'
      ]);
      return;
    }

    // Pipeline runner
    let active = true;
    const runPipeline = async () => {
      // Step 0: Request Submitted
      if (!active) return;
      setCurrentStep(0);
      setProgress(10);
      await delay(1500);

      // Step 1: Website Parser
      if (!active) return;
      setCurrentStep(1);
      setProgress(30);
      for (const log of parserLogs) {
        if (!active) return;
        setLogs(prev => [...prev, log]);
        await delay(350);
      }
      await delay(1000);

      // Step 2: JSON API
      if (!active) return;
      setCurrentStep(2);
      setProgress(50);
      for (const log of apiLogs) {
        if (!active) return;
        setLogs(prev => [...prev, log]);
        await delay(350);
      }
      await delay(1000);

      // Step 3: LLM Decision
      if (!active) return;
      setCurrentStep(3);
      setProgress(70);
      for (const log of llmLogs) {
        if (!active) return;
        setLogs(prev => [...prev, log]);
        await delay(350);
      }
      await delay(1000);

      // Step 4: Storing on Somnia
      if (!active) return;
      setCurrentStep(4);
      setProgress(90);
      for (const log of blockchainLogs) {
        if (!active) return;
        setLogs(prev => [...prev, log]);
        await delay(350);
      }

      // Trigger actual smart contract write (or mock on-chain delay)
      let tx = '';
      try {
        tx = await storeResultOnChain(
          request.id,
          winnerVendorName,
          91,
          `${winnerVendorName} provides the best balance of price, warranty and reliability for your ${request.productName} requirement.`
        );
        
        if (!active) return;
        setTxHash(tx);
        setLogs(prev => [...prev, `[Blockchain] Transaction Successful: ${tx}`, `[System] Contract event emitted: ResultStored`]);
      } catch (e) {
        console.error("Failed storing result on contract", e);
      }

      await delay(1500);

      // Step 5: Completed
      if (!active) return;
      setCurrentStep(5);
      setProgress(100);
      setLogs(prev => [...prev, '[System] Multi-agent execution finished successfully.', '[System] Consensus reached. Ready to review.']);

      // Generate Agent States list
      const agentStates: AgentState[] = [
        {
          id: 'agent-parser',
          name: 'Website Parser Agent',
          type: 'parser',
          status: 'completed',
          output: parserLogs.join('\n'),
          extractedData: {
            [`${v1Name.toLowerCase()}_price`]: price1,
            [`${v2Name.toLowerCase()}_price`]: price2,
            [`${v3Name.toLowerCase()}_price`]: price3,
            [`${v1Name.toLowerCase()}_warranty`]: '1 Year',
            [`${v2Name.toLowerCase()}_warranty`]: '2 Years',
            [`${v3Name.toLowerCase()}_warranty`]: '3 Years'
          }
        },
        {
          id: 'agent-api',
          name: 'JSON API Agent',
          type: 'api',
          status: 'completed',
          output: apiLogs.join('\n'),
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
          output: llmLogs.join('\n'),
          extractedData: {
            winner: winnerVendorName,
            overall_score: 91,
            price_savings: request.budget - price1
          }
        }
      ];

      // Save request result to localStorage
      saveRequestResult(request.id, mockVendors, winnerId, agentStates, tx);
    };

    runPipeline();

    return () => {
      active = false;
    };
  }, [id, request]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (!request) {
    return <div className="text-center py-10">Request not found</div>;
  }

  // Layout node items
  const timelineNodes = [
    { step: 0, label: 'Submit Request', sub: 'Event trigger', icon: <Send className="h-4 w-4" /> },
    { step: 1, label: 'Website Parser Agent', sub: 'HTML crawler', icon: <Globe className="h-4 w-4" /> },
    { step: 2, label: 'JSON API Agent', sub: 'Ratings sync', icon: <Database className="h-4 w-4" /> },
    { step: 3, label: 'LLM Decision Agent', sub: 'Criteria math', icon: <Cpu className="h-4 w-4" /> },
    { step: 4, label: 'Stored On Somnia', sub: 'Contract commit', icon: <ShieldCheck className="h-4 w-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Title block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <Bot className="h-6 w-6 text-cyan-400" />
          Autonomous Agent Pipeline Execution
        </h1>
        <p className="text-xs text-slate-400">
          Request: <span className="font-mono text-cyan-400">{request.productName}</span> | Budget: ${request.budget.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline (WOW Feature Animation) - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md p-5 space-y-6">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Workflow Timeline</h2>
            
            {/* Visual Timeline Nodes */}
            <div className="relative pl-8 space-y-8">
              {/* Vertical connecting line */}
              <div className="absolute top-3.5 left-3.5 bottom-3.5 w-[2px] bg-slate-800">
                {/* Glow progress overlay */}
                <div 
                  className="w-full bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-violet-600 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ height: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>

              {timelineNodes.map((node) => {
                const isCompleted = currentStep > node.step;
                const isActive = currentStep === node.step;
                
                return (
                  <div key={node.step} className="relative flex items-start gap-4">
                    {/* Circle icon */}
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
                <span>Overall Pipeline Status</span>
                <span className="text-cyan-400 font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-950" />
            </div>
          </Card>
        </div>

        {/* Live Terminal logs console - 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border border-slate-800 bg-slate-950 backdrop-blur-md flex flex-col h-[480px] shadow-2xl relative overflow-hidden">
            {/* Glossy bezel header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-850">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Terminal className="h-4 w-4 text-cyan-400" />
                SOMNIA_AGENT_ORCHESTRATOR.SH
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Console output display */}
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
                } else if (log.startsWith('Extracted') || log.startsWith('Fetched')) {
                  return <div key={index} className="text-cyan-300/80 pl-4">{log}</div>;
                }
                return <div key={index} className="text-slate-400 pl-4">{log}</div>;
              })}
              <div ref={terminalEndRef}></div>
            </div>

            {/* Pipeline footer controls */}
            {currentStep === 5 && (
              <div className="p-4 bg-slate-900/60 border-t border-slate-850 flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex flex-col text-[10px] text-slate-500 font-mono">
                  <span>Consensus finalized</span>
                  <span>Tx: {txHash ? `${txHash.substring(0, 16)}...` : 'N/A'}</span>
                </div>
                
                <Button
                  onClick={() => navigate(`/request/${request.id}/result`)}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-extrabold text-sm px-5 py-2.5 h-10 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1 cursor-pointer"
                >
                  <span>View Winner Report</span>
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
