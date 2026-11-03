import React from 'react';
import { Grid } from 'lucide-react';
import InfoTooltip from './common/InfoTooltip';

/**
 * ConfusionMatrix Component
 * 
 * 2x2 Evaluation split contingency table for YOLO validation.
 * Styled for light theme with soft semantic accents.
 */
export default function ConfusionMatrix({ matrixData = null }) {
  const hasData = matrixData && typeof matrixData.tp !== 'undefined';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Grid className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
              Confusion Matrix
              <InfoTooltip topicId="confusion-matrix" label="Confusion matrix guide" />
            </h3>
            <span className="text-[11px] text-slate-500">
              YOLOv11 Validation Split (2,123 Images)
            </span>
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  Actual \ Predicted
                </th>
                <th className="p-2 border border-slate-200 bg-blue-50 text-blue-800 font-semibold">
                  Ambulance
                </th>
                <th className="p-2 border border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                  Normal Traffic
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-200 bg-blue-50 text-blue-900 font-semibold">
                  Ambulance
                </td>
                <td className="p-3 border border-slate-200 bg-emerald-50 text-emerald-800 font-bold text-sm">
                  TP: {matrixData.tp}
                </td>
                <td className="p-3 border border-slate-200 bg-red-50 text-red-800">
                  FN: {matrixData.fn}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                  Normal Traffic
                </td>
                <td className="p-3 border border-slate-200 bg-amber-50 text-amber-800">
                  FP: {matrixData.fp}
                </td>
                <td className="p-3 border border-slate-200 bg-slate-50 text-slate-800 font-bold text-sm">
                  TN: {matrixData.tn}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Confusion matrix data will update from the model validation endpoint.
        </div>
      )}
    </div>
  );
}
