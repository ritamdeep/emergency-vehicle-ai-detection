import React from 'react';
import { useRouter } from '../context/RouterContext';
import { useTraffic } from '../context/TrafficContext';
import StatusPill from '../components/common/StatusPill';
import { ArrowRight } from 'lucide-react';

/**
 * Home Page (/)
 * 
 * Minimal, focused landing hero:
 * - Single live status pill
 * - One headline and 1-sentence description
 * - Direct primary link to View Live Junction
 */
export default function Home() {
  const { navigate } = useRouter();
  const { mode } = useTraffic();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-6">
      {/* Single Live Status Pill */}
      <div>
        <StatusPill mode={mode} withTooltip={true} />
      </div>

      {/* Primary Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
        Smart traffic signals that clear the way for ambulances.
      </h1>

      {/* Short Descriptive Sentence */}
      <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
        AI detects emergency vehicles in live CCTV camera feeds and turns traffic lights green automatically.
      </p>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate('/junction')}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all active:scale-98"
        >
          View Live Junction
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
