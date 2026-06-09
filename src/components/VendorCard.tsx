import React from 'react';
import { Star, BadgePercent, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import type { VendorData } from '../types/procurement';

interface VendorCardProps {
  vendor: VendorData;
  isWinner?: boolean;
  budget: number;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, isWinner = false, budget }) => {
  const priceSavings = budget - vendor.price;
  const savingsPercent = ((priceSavings / budget) * 100).toFixed(0);

  return (
    <Card className={`relative overflow-hidden border bg-slate-900/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
      isWinner 
        ? 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {isWinner && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-violet-600 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
          <Award className="h-3.5 w-3.5" />
          AI Winner Choice
        </div>
      )}

      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {vendor.name}
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono mt-1 block">ID: {vendor.id}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
              ${vendor.price.toLocaleString()}
            </span>
            {priceSavings > 0 ? (
              <span className="text-[10px] text-emerald-400 font-bold block flex items-center justify-end gap-0.5 mt-0.5">
                <BadgePercent className="h-3 w-3" />
                Saves {savingsPercent}% (${priceSavings.toLocaleString()})
              </span>
            ) : (
              <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">
                At budget limit
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-5 pt-1">
        {/* Core Attributes */}
        <div className="grid grid-cols-2 gap-3.5 bg-slate-950/60 rounded-xl p-3 border border-slate-900">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-950/40 text-violet-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Warranty</span>
              <span className="text-xs font-bold text-slate-200">{vendor.warranty}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-950/40 text-amber-400">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-semibold block uppercase">Rating</span>
              <span className="text-xs font-bold text-slate-200">{vendor.rating} / 5.0</span>
            </div>
          </div>
        </div>

        {/* Score metrics */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
              <span>Price Score</span>
              <span className="text-cyan-400">{vendor.scores.price}/100</span>
            </div>
            <Progress value={vendor.scores.price} className="h-1.5 bg-slate-950" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
              <span>Quality Score</span>
              <span className="text-violet-400">{vendor.scores.quality}/100</span>
            </div>
            <Progress value={vendor.scores.quality} className="h-1.5 bg-slate-950" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
              <span>Reliability Score</span>
              <span className="text-fuchsia-400">{vendor.scores.reliability}/100</span>
            </div>
            <Progress value={vendor.scores.reliability} className="h-1.5 bg-slate-950" />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-200">Overall AI Score</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-extrabold text-base">
                {vendor.scores.overall}/100
              </span>
            </div>
          </div>
        </div>

        {/* Reasoning Brief */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">AI Verdict Snippet</span>
          <p className="text-[11px] text-slate-300 leading-normal italic">
            "{vendor.reasoning}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
