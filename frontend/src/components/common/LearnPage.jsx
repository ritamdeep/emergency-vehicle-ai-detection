import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ArrowLeft, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { getLearnTopicById } from '../../data/learnContent';

/**
 * LearnPage Component Template
 * 
 * Standardized documentation template for /learn/[feature]:
 * - Header with category and back button
 * - What it is
 * - Why it matters
 * - How it works (numbered step cards)
 * - How to read it (with clear concrete example)
 * - Related features (clickable cross-reference tags)
 */
export default function LearnPage({ topicId }) {
  const { navigate } = useRouter();
  const topic = getLearnTopicById(topicId);

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Feature Guide Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The requested documentation topic could not be found.
        </p>
        <button
          onClick={() => navigate('/learn')}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guide Overview
        </button>
      </div>
    );
  }

  const {
    title,
    category,
    summary,
    whatItIs,
    whyItMatters,
    howItWorks,
    howToRead,
    relatedFeatures = [],
  } = topic;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/learn')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Guides
        </button>
      </div>

      {/* Title & Category Header */}
      <header className="pb-8 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {category}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-base text-slate-600 mt-2 leading-relaxed">
          {summary}
        </p>
      </header>

      {/* Main Content Sections */}
      <div className="py-8 space-y-10">
        {/* 1. What it is */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            What it is
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {whatItIs}
          </p>
        </section>

        {/* 2. Why it matters */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Why it matters
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {whyItMatters}
          </p>
        </section>

        {/* 3. How it works */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            How it works
          </h2>
          <div className="space-y-3">
            {Array.isArray(howItWorks) ? (
              howItWorks.map(({ step, title: stepTitle, desc }) => (
                <div
                  key={step}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {stepTitle}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{howItWorks}</p>
            )}
          </div>
        </section>

        {/* 4. How to read it */}
        <section className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm mb-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>How to read it in the app</span>
          </div>
          <p className="text-sm text-blue-900/80 leading-relaxed">
            {howToRead}
          </p>
        </section>

        {/* 5. Related features */}
        {relatedFeatures.length > 0 && (
          <section className="pt-6 border-t border-slate-200">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Related Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedFeatures.map((relId) => {
                const relTopic = getLearnTopicById(relId);
                if (!relTopic) return null;
                return (
                  <button
                    key={relId}
                    type="button"
                    onClick={() => navigate(`/learn/${relId}`)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 shadow-xs transition-colors"
                  >
                    {relTopic.title} →
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
