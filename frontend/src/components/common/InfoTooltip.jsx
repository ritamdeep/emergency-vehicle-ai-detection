import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { HelpCircle } from 'lucide-react';

/**
 * InfoTooltip Component
 * 
 * Renders an accessible, unobtrusive '?' icon that directly links
 * to the corresponding /learn/[featureId] documentation page.
 */
export default function InfoTooltip({ topicId, label = 'Learn more' }) {
  const { navigate } = useRouter();

  if (!topicId) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/learn/${topicId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${label} (opens documentation)`}
      title={`${label} — Click to learn how this works`}
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ml-1.5 align-middle"
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </button>
  );
}
