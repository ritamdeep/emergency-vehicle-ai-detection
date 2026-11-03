import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

/**
 * CollapsibleSection Component
 * 
 * Progressive disclosure card for technical metrics, confusion matrix, and graphs.
 * Keeps pages clean while giving curious users instant access to depth.
 */
export default function CollapsibleSection({
  title,
  subtitle = '',
  topicId = null,
  defaultOpen = false,
  badge = null,
  children,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all ${className}`}
    >
      <div className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/75 transition-colors">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className="flex-1 flex items-center justify-between cursor-pointer select-none focus:outline-none"
        >
          <div>
            <div className="flex items-center">
              <span className="text-base font-semibold text-slate-900">
                {title}
              </span>
              {badge && (
                <span className="ml-2.5 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium shrink-0 ml-4">
            <span className="text-xs text-slate-400">
              {isOpen ? 'Hide details' : 'Show details'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>
        </div>

        {topicId && (
          <div className="ml-2 shrink-0">
            <InfoTooltip topicId={topicId} label={title} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/30 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
