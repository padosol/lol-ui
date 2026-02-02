"use client";

import type { MetaPrediction } from "@/types/patchnotes";
import { TrendingUp } from "lucide-react";

interface MetaPredictionsProps {
  predictions: MetaPrediction[];
}

export default function MetaPredictions({ predictions }: MetaPredictionsProps) {
  if (predictions.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-divider/30">
        <TrendingUp className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-bold text-on-surface">메타 영향 예측</h3>
      </div>

      <div className="divide-y divide-divider/30">
        {predictions.map((prediction, index) => (
          <div key={index} className="p-4">
            <h4 className="text-sm font-semibold text-primary mb-2">
              {prediction.category}
            </h4>
            <ul className="space-y-1.5">
              {prediction.predictions.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex items-start gap-2 text-sm text-on-surface-medium"
                >
                  <span className="text-on-surface-medium mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
