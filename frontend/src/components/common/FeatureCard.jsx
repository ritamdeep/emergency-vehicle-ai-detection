import React from 'react';
import { Link } from '../../context/RouterContext';
import { ArrowUpRight } from 'lucide-react';

/**
 * FeatureCard Component
 * 
 * Large, minimal navigation card on the Home screen.
 * Displays an icon, a 2-4 word title, and a 1-line description.
 */
export default function FeatureCard({
  to,
  icon: Icon,
  title,
  description,
  badge = null,
  className = '',
}) {
  return (
    <Link
      to={to}
      className={`group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {badge}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}
