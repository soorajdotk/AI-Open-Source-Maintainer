import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Columns, GitCommit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { RecommendationCard } from '../components/RecommendationCard';
import { VendorCard } from '../components/VendorCard';
import { AgentCard } from '../components/AgentCard';
import type { ProcurementRequest } from '../types/procurement';

interface RecommendationProps {
  requests: ProcurementRequest[];
}

export const Recommendation: React.FC<RecommendationProps> = ({ requests }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const request = requests.find(r => r.id === id);
  const [activeViewTab, setActiveViewTab] = useState<'comparison' | 'agents'>('comparison');

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

  if (request.status !== 'completed' || !request.vendors || !request.winnerId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-350">Evaluation Incomplete</h2>
        <p className="text-xs text-slate-500">
          The agent pipeline has not finished executing for this request. Please launch the pipeline first.
        </p>
        <Button 
          onClick={() => navigate(`/request/${request.id}/agents`)}
          size="sm" 
          className="bg-violet-600 hover:bg-violet-500 rounded-full cursor-pointer"
        >
          Go to Agent Activity
        </Button>
      </div>
    );
  }

  // Find the winning vendor object
  const winner = request.vendors.find(v => v.id === request.winnerId) || request.vendors[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Navigation & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={() => navigate(`/request/${request.id}`)} 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Request Details
        </button>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
          <GitCommit className="h-4 w-4 text-cyan-400" />
          <span>Ledger state synced with block confirmation</span>
        </div>
      </div>

      {/* Main recommendation result card (The WOW card) */}
      <RecommendationCard
        winnerName={winner.name}
        overallScore={winner.scores.overall}
        reasoning={winner.reasoning}
        txHash={request.txHash}
        timestamp={request.timestamp}
      />

      {/* Tabbed view toggler */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Columns className="h-5 w-5 text-violet-400" />
            Evaluation Breakdowns
          </h2>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveViewTab('comparison')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeViewTab === 'comparison'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vendor Comparison
            </button>
            <button
              onClick={() => setActiveViewTab('agents')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeViewTab === 'agents'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agent Worklogs
            </button>
          </div>
        </div>

        {/* Tab 1: Vendor Comparison Cards */}
        {activeViewTab === 'comparison' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {request.vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                isWinner={vendor.id === request.winnerId}
                budget={request.budget}
              />
            ))}
          </div>
        )}

        {/* Tab 2: Agent activity logs */}
        {activeViewTab === 'agents' && request.agents && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {request.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
