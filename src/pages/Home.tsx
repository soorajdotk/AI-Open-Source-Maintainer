import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Database, Sparkles, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const Home: React.FC = () => {
  return (
    <div className="relative overflow-hidden min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Background Neon Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/20 text-xs font-bold text-violet-300 mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)] animate-bounce">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          Autonomous On-Chain Vendor Bidding
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] mb-6">
          Streamline Procurement with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
            Autonomous AI Agents
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
          AgentProcure AI is an AI-powered autonomous procurement and vendor evaluation platform built on Somnia. 
          Define your budgets, submit raw vendor URLs, and let our distributed multi-agent systems crawl, 
          verify, rank, and settle procurement transactions on-chain.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/create">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-7 py-3.5 h-12 rounded-full border border-violet-400/20 shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2 cursor-pointer">
              <span>Create Procurement Request</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 font-semibold px-7 py-3.5 h-12 rounded-full hover:bg-slate-900 flex items-center gap-2 cursor-pointer">
              <span>View Dashboard</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Counter / Highlights */}
      <section className="w-full max-w-7xl mx-auto px-4 py-8 z-10 border-y border-slate-900/60 bg-slate-950/40 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-mono">100%</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold uppercase">Autonomous Process</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-mono">&lt; 2m</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold uppercase">Evaluation Time</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-mono">15% +</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold uppercase">Average Savings</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-mono">Somnia</span>
            <span className="text-xs text-slate-400 block mt-1 font-semibold uppercase">L1 Security & Speed</span>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl w-full mx-auto px-4 py-20 z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-slate-100">Autonomous Workflow Pipeline</h2>
          <p className="text-sm text-slate-400 mt-2">
            Our multi-agent system runs a state-locked sequential evaluation workflow, registering outputs securely on the block.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Submit Requirement',
              desc: 'Enter the product requirements, your spending budget, and up to three vendor links you wish to evaluate.',
              color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
            },
            {
              step: '02',
              title: 'Agent Collects Data',
              desc: 'Web Parser and JSON API agents fetch web metadata, pricing specs, customer ratings, and warranty conditions.',
              color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
            },
            {
              step: '03',
              title: 'AI Evaluates Vendors',
              desc: 'The LLM Inference agent weighs prices, ratings, and features, assigning overall scores against your budget parameters.',
              color: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/20',
            },
            {
              step: '04',
              title: 'Best Vendor Selected',
              desc: 'The winner is declared, saving analysis records. Results are committed to the Somnia contract ledger.',
              color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
            },
          ].map((item, index) => (
            <Card key={index} className={`bg-slate-900/30 border border-slate-800 backdrop-blur-sm overflow-hidden relative group hover:border-slate-700 transition-all duration-300`}>
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-slate-800/40 text-[10px] font-bold px-3 py-1 text-slate-500 rounded-bl-lg font-mono">
                STEP {item.step}
              </div>
              <CardContent className="p-6 pt-8 space-y-3">
                <span className="text-3xl font-black text-slate-800 group-hover:text-cyan-500/25 transition-colors duration-300">{item.step}</span>
                <h3 className="text-base font-extrabold text-slate-200">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Somnia / Agent Showcase Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 border-t border-slate-900/60 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 leading-snug">
              Powered by <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                Somnia L1 Agent Network
              </span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Somnia’s ultra-fast block times and high throughput allow multi-agent systems to synchronize execution states, 
              store parameters on-chain, and trigger automated payouts without expensive RPC lag or high gas spikes.
            </p>
            <div className="pt-2">
              <Link to="/create">
                <Button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-4 h-9 rounded-full cursor-pointer">
                  Launch Platform
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe className="h-6 w-6 text-violet-400" />,
                title: 'LLM Parse Website Agent',
                desc: 'Scrapes HTML, extracts raw specifications, price indicators, delivery estimates, and warranty parameters.',
              },
              {
                icon: <Database className="h-6 w-6 text-cyan-400" />,
                title: 'JSON API Agent',
                desc: 'Queries API endpoints, checks store availability, queries review platforms, and logs reliability numbers.',
              },
              {
                icon: <Bot className="h-6 w-6 text-fuchsia-400" />,
                title: 'LLM Inference Agent',
                desc: 'Consolidates criteria weights, evaluates budget ceilings, constructs trade-offs, and issues recommendation reports.',
              },
            ].map((agent, index) => (
              <div key={index} className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 border border-slate-800/80 mb-4 shadow-md">
                  {agent.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-200">{agent.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-8 border-t border-slate-900/60 z-10 text-center text-xs text-slate-500">
        <p>© 2026 AgentProcure AI. Powered by Somnia Shannon Testnet. All rights reserved.</p>
      </footer>
    </div>
  );
};
