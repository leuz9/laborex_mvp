import React from 'react';
import ComingSoonBanner from '../ComingSoonBanner';
import { Users, TrendingUp, Target, Award } from 'lucide-react';
import type { TeamMember } from '../../types';

interface TeamAnalyticsProps {
  members: TeamMember[];
  timeframe: 'week' | 'month' | 'quarter';
}

const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ members, timeframe }) => {
  return (
    <div className="space-y-6">
      <ComingSoonBanner />
      {/* Contenu existant */}
    </div>
  );
};

export default TeamAnalytics;