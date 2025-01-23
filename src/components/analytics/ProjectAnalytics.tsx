import React from 'react';
import ComingSoonBanner from '../ComingSoonBanner';
import { Calendar, Clock, Users, BarChart2, MessageSquare, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectAnalyticsProps {
  project: Project;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ project }) => {
  return (
    <div className="space-y-6">
      <ComingSoonBanner />
      {/* Contenu existant */}
    </div>
  );
};

export default ProjectAnalytics;