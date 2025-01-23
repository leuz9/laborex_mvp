import React from 'react';
import ComingSoonBanner from './ComingSoonBanner';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { AIInsight } from '../types';

interface AIAnalyticsProps {
  insights: AIInsight[];
}

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ insights }) => {
  return (
    <div className="space-y-6">
      <ComingSoonBanner />
      {/* Contenu existant */}
    </div>
  );
};

export default AIAnalytics;