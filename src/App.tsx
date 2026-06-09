import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CreateRequest } from './pages/CreateRequest';
import { Dashboard } from './pages/Dashboard';
import { RequestDetails } from './pages/RequestDetails';
import { AgentActivity } from './pages/AgentActivity';
import { Recommendation } from './pages/Recommendation';
import { History } from './pages/History';
import { useWallet } from './hooks/useWallet';
import type { ProcurementRequest, VendorData, AgentState } from './types/procurement';
import { Info } from 'lucide-react';

// Seed initial mock data so judges have active listings to review instantly
const SEED_REQUESTS: ProcurementRequest[] = [
  {
    id: 'req-laptops-seed',
    productName: 'Enterprise Developer Laptops',
    budget: 50000,
    vendorUrls: [
      'https://dell.com/xps-laptop-dev',
      'https://hp.com/spectre-x360-pro',
      'https://lenovo.com/thinkpad-x1-extreme'
    ],
    status: 'completed',
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
    timestamp: Date.now() - 3600000 * 24,
    winnerId: 'V-DELL',
    txHash: '0x89271bb0b68d4979a59189271bb0b68d4979a59189271bb0b68d4979a591fae2',
    vendors: [
      {
        id: 'V-DELL',
        name: 'Dell XPS 15 (Simulated)',
        price: 45000,
        warranty: '1-Year Premium Warranty',
        rating: 4.6,
        scores: { price: 92, quality: 88, reliability: 95, overall: 91 },
        reasoning: 'Dell XPS laptop represents the highest reliability index and fits comfortably within the $50,000 threshold budget.'
      },
      {
        id: 'V-HP',
        name: 'HP Spectre x360 (Simulated)',
        price: 48000,
        warranty: '2-Year Limited Warranty',
        rating: 4.2,
        scores: { price: 84, quality: 90, reliability: 86, overall: 87 },
        reasoning: 'HP Spectre provides excellent warranty and build quality, but pricing is higher reducing overall cost efficiency.'
      },
      {
        id: 'V-LENOVO',
        name: 'Lenovo ThinkPad X1 (Simulated)',
        price: 49500,
        warranty: '3-Year Onsite Support',
        rating: 4.5,
        scores: { price: 78, quality: 92, reliability: 90, overall: 85 },
        reasoning: 'Lenovo ThinkPad leads in warranty duration but borders the budget threshold, dampening score totals.'
      }
    ],
    agents: [
      {
        id: 'agent-parser',
        name: 'Website Parser Agent',
        type: 'parser',
        status: 'completed',
        output: '>> Launching Website Parser Agent...\nConnecting to Dell URL...\nExtracted Price: $45,000\nConnecting to HP URL...\nExtracted Price: $48,000\nConnecting to Lenovo URL...\nExtracted Price: $49,500\nSuccess: Scraped HTML pages.',
        extractedData: {
          dell_price: 45000,
          hp_price: 48000,
          lenovo_price: 49500
        }
      },
      {
        id: 'agent-api',
        name: 'JSON API Agent',
        type: 'api',
        status: 'completed',
        output: '>> Launching JSON API Agent...\nQuerying Trustpilot reviews...\nDell rating: 4.6/5\nHP rating: 4.2/5\nLenovo rating: 4.5/5\nSuccess: Sentiment indexes loaded.',
        extractedData: {
          dell_rating: 4.6,
          hp_rating: 4.2,
          lenovo_rating: 4.5
        }
      },
      {
        id: 'agent-llm',
        name: 'LLM Decision Agent',
        type: 'llm',
        status: 'completed',
        output: '>> Launching LLM Decision Agent...\nComputing weighted equations...\nDell Overall: 91\nHP Overall: 87\nLenovo Overall: 85\nSuccess: Recommended Winner - Dell',
        extractedData: {
          winner: 'Dell',
          overall_score: 91
        }
      }
    ]
  },
  {
    id: 'req-gpu-seed',
    productName: 'Database GPU Host Nodes',
    budget: 15000,
    vendorUrls: [
      'https://nvidia.com/dgx-cloud',
      'https://lambdalabs.com/gpu-cloud',
      'https://paperspace.com/gpu-pricing'
    ],
    status: 'pending',
    createdAt: Date.now() - 3600000 // 1 hour ago
  }
];

export default function App() {
  const {
    walletAddress,
    walletBalance,
    networkName,
    isConnected,
    isConnecting,
    isSimulated,
    connectWallet,
    disconnectWallet
  } = useWallet();

  const [requests, setRequests] = useState<ProcurementRequest[]>([]);

  // Load from local storage or set seeds on load
  useEffect(() => {
    const saved = localStorage.getItem('agent_procure_requests');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse requests from localstorage, using seeds", e);
        setRequests(SEED_REQUESTS);
        localStorage.setItem('agent_procure_requests', JSON.stringify(SEED_REQUESTS));
      }
    } else {
      setRequests(SEED_REQUESTS);
      localStorage.setItem('agent_procure_requests', JSON.stringify(SEED_REQUESTS));
    }
  }, []);

  // Sync to local storage
  const syncRequests = (updatedRequests: ProcurementRequest[]) => {
    setRequests(updatedRequests);
    localStorage.setItem('agent_procure_requests', JSON.stringify(updatedRequests));
  };

  const addRequest = (req: ProcurementRequest) => {
    const updated = [req, ...requests];
    syncRequests(updated);
  };

  const updateRequestStatus = (id: string, status: ProcurementRequest['status']) => {
    const updated = requests.map(req =>
      req.id === id ? { ...req, status } : req
    );
    syncRequests(updated);
  };

  const updateRequestRequestId = (id: string, requestId: string) => {
    const updated = requests.map(req =>
      req.id === id ? { ...req, id: requestId } : req
    );
    syncRequests(updated);
  };

  const saveRequestResult = (
    id: string,
    vendors: VendorData[],
    winnerId: string,
    agents: AgentState[],
    txHash: string
  ) => {
    const updated = requests.map(req =>
      req.id === id
        ? {
          ...req,
          status: 'completed' as const,
          vendors,
          winnerId,
          agents,
          txHash,
          timestamp: Date.now()
        }
        : req
    );
    syncRequests(updated);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
        {/* Navigation */}
        <Navbar
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          networkName={networkName}
          isConnected={isConnected}
          isConnecting={isConnecting}
          isSimulated={isSimulated}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />

        {/* Floating Simulation Alert for Hackathon Judges */}
        {isSimulated && (
          <div className="bg-amber-950/60 border-y border-amber-800/40 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2 backdrop-blur-sm z-40">
            <Info className="h-4 w-4 animate-bounce text-amber-400" />
            <span>
              MetaMask was not detected or connected. The app is running in <strong>Web3 Sandbox Simulation mode</strong>.
              All contract queries and transactions are mock-compiled inside the browser.
            </span>
          </div>
        )}

        {/* Page Router Outlet */}
        <main className="flex-1 bg-slate-950">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/create"
              element={
                <CreateRequest
                  addRequest={addRequest}
                />
              }
            />

            <Route
              path="/dashboard"
              element={<Dashboard requests={requests} />}
            />

            <Route
              path="/request/:id"
              element={
                <RequestDetails
                  requests={requests}
                  updateRequestStatus={updateRequestStatus}
                  updateRequestRequestId={updateRequestRequestId}
                />
              }
            />

            <Route
              path="/request/:id/agents"
              element={
                <AgentActivity
                  requests={requests}
                  saveRequestResult={saveRequestResult}
                />
              }
            />

            <Route
              path="/request/:id/result"
              element={<Recommendation requests={requests} />}
            />

            <Route
              path="/history"
              element={<History requests={requests} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
