import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { ProcurementRequest } from '../types/procurement';
import { submitRequest } from '../services/procurementService';
import { getProcureContract } from '../contracts/agentProcure';
import { ethers } from 'ethers';

interface CreateRequestProps {
  addRequest: (req: ProcurementRequest) => void;
}

export const CreateRequest: React.FC<CreateRequestProps> = ({ addRequest }) => {
  const navigate = useNavigate();
  
  const [productName, setProductName] = useState('');
  const [budget, setBudget] = useState('');
  const [url1, setUrl1] = useState('https://www.dell.com');
  const [url2, setUrl2] = useState('https://www.hp.com');
  const [url3, setUrl3] = useState('https://www.lenovo.com');
  
  const [loading, setLoading] = useState(false);
  const [txLog, setTxLog] = useState('');
  const [successData, setSuccessData] = useState<{ requestId: string; txHash: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !budget) return;
    
    setLoading(true);
    setTxLog('Connecting to Somnia Web3 gateway...');

    try {
      const budgetNum = parseFloat(budget);
      const vendorUrls = [url1, url2, url3].filter(url => url.trim() !== '');

      setTxLog('Signing smart contract transaction on Somnia Ledger...');
      
      const receipt = await submitRequest(productName, budgetNum, vendorUrls);
      const txHash = receipt.hash || receipt.transactionHash || "";

      setTxLog('Parsing event logs...');

      // Parse ProcurementCreated event log
      let requestId = "";
      const contract = await getProcureContract();
      
      // Fallback 1: Parse from interface
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "ProcurementCreated") {
            requestId = parsedLog.args.requestId.toString();
            break;
          }
        } catch (err) {
          // Ignore
        }
      }

      // Fallback 2: Direct topic matching
      if (!requestId && receipt.logs) {
        const topicHash = ethers.id("ProcurementCreated(uint256,address,string)");
        for (const log of receipt.logs) {
          if (log.topics && log.topics[0] === topicHash) {
            if (log.topics[1]) {
              try {
                requestId = BigInt(log.topics[1]).toString();
                break;
              } catch (e) {
                // Ignore
              }
            }
          }
        }
      }

      // Fallback 3: Query contract requestCounter
      if (!requestId) {
        try {
          const counter = await contract.requestCounter();
          if (counter && counter.toString() !== "0") {
            requestId = counter.toString();
          }
        } catch (err) {
          console.error("Failed to query requestCounter fallback", err);
        }
      }

      if (!requestId) {
        throw new Error("Could not extract requestId from transaction logs.");
      }

      // Store transaction mapping in localStorage for blockchain verification page
      localStorage.setItem("submit_tx_" + requestId, txHash);

      // Add to local state/localStorage
      const newRequest: ProcurementRequest = {
        id: requestId,
        productName,
        budget: budgetNum,
        vendorUrls,
        status: 'pending',
        createdAt: Date.now(),
        txHash: txHash,
        timestamp: Date.now()
      };
      addRequest(newRequest);
      
      setSuccessData({
        requestId,
        txHash
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to submit request", error);
      setTxLog('Transaction execution failed. Try again.');
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          
          <CardHeader className="pb-5 pt-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500 text-emerald-400 mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
              <CheckCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-100">Request Created Successfully</CardTitle>
          </CardHeader>
          
          <CardContent className="pb-8 space-y-6 text-center">
            <div className="bg-slate-950/60 rounded-xl p-6 border border-slate-900 font-mono text-sm space-y-4 text-left max-w-md mx-auto shadow-inner">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold tracking-wider mb-0.5">Request ID</span>
                <span className="text-slate-100 font-bold text-lg">{successData.requestId}</span>
              </div>
              <div className="h-[1px] bg-slate-900" />
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold tracking-wider mb-0.5">Transaction Hash</span>
                <span className="text-cyan-400 text-xs break-all select-all font-mono">{successData.txHash}</span>
              </div>
            </div>
            
            <Button
              onClick={() => navigate(`/request/${successData.requestId}`)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 h-11 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              Proceed to Request Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500"></div>
        
        <CardHeader className="pb-5 pt-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-2xl font-bold text-slate-100">Create Procurement Request</CardTitle>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Specify the product requirement, overall budget, and direct links to online vendor specifications. 
            Once submitted, Somnia AI Agents will autonomously verify metrics and write evaluation receipts.
          </p>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Product Name / Title</label>
                <Input 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Enterprise Laptop"
                  required
                  disabled={loading}
                  className="bg-slate-950/80 border-slate-800 focus:border-violet-500 rounded-xl text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Budget (USD)</label>
                <Input 
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50000"
                  required
                  disabled={loading}
                  className="bg-slate-950/80 border-slate-800 focus:border-violet-500 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Target Vendor URLs</label>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">Vendor 1 URL</span>
                  <Input 
                    type="url"
                    value={url1}
                    onChange={(e) => setUrl1(e.target.value)}
                    placeholder="https://www.dell.com"
                    disabled={loading}
                    className="bg-slate-950/80 border-slate-800 focus:border-violet-500 rounded-xl font-mono text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">Vendor 2 URL</span>
                  <Input 
                    type="url"
                    value={url2}
                    onChange={(e) => setUrl2(e.target.value)}
                    placeholder="https://www.hp.com"
                    disabled={loading}
                    className="bg-slate-950/80 border-slate-800 focus:border-violet-500 rounded-xl font-mono text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">Vendor 3 URL</span>
                  <Input 
                    type="url"
                    value={url3}
                    onChange={(e) => setUrl3(e.target.value)}
                    placeholder="https://www.lenovo.com"
                    disabled={loading}
                    className="bg-slate-950/80 border-slate-800 focus:border-violet-500 rounded-xl font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 w-full justify-center text-xs font-mono text-cyan-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{txLog}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] leading-snug">
                    <AlertCircle className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    <span>This operation will broadcast a request event metadata transaction to the Somnia Ledger.</span>
                  </div>
                  <Button 
                    type="submit"
                    className="w-full md:w-auto bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-6 py-2.5 h-11 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Request</span>
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
