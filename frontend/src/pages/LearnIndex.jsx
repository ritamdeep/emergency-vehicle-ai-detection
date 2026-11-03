import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { LEARN_TOPICS } from '../data/learnContent';
import { BookOpen, Search, ArrowRight } from 'lucide-react';

/**
 * LearnIndex Page (/learn)
 * 
 * Comprehensive directory of all system components and ML concepts.
 * Features search filtering and categorized cards.
 */
export default function LearnIndex() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = LEARN_TOPICS.filter((topic) => {
    const q = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(q) ||
      topic.summary.toLowerCase().includes(q) ||
      topic.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          System Guide & Documentation
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How Every Component Works
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">
          Learn the principles behind computer vision detection, optical strobe verification, and signal preemption logic.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. YOLO, signals, confusion matrix)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {filteredTopics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => navigate(`/learn/${topic.id}`)}
            className="group p-5 text-left bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {topic.category}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>

              <h2 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {topic.title}
              </h2>

              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                {topic.summary}
              </p>
            </div>

            <span className="text-xs font-semibold text-blue-600 mt-4 block">
              Read guide →
            </span>
          </button>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-500">
          No guides match "{searchQuery}". Try searching for "YOLO", "signals", or "metrics".
        </div>
      )}
    </div>
  );
}
