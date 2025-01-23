import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Team from './components/Team';
import Products from './components/Products';
import Tasks from './components/Tasks';
import WorkloadManager from './components/WorkloadManager';
import AIAnalytics from './components/AIAnalytics';
import BudgetAnalytics from './components/analytics/BudgetAnalytics';
import PerformanceMetrics from './components/analytics/PerformanceMetrics';
import ProjectAnalytics from './components/analytics/ProjectAnalytics';
import ResourceUtilization from './components/analytics/ResourceUtilization';
import TeamAnalytics from './components/analytics/TeamAnalytics';
import GamificationHub from './components/GamificationHub';
import CareerDevelopment from './components/CareerDevelopment';
import FeedbackSystem from './components/FeedbackSystem';
import WellnessTracker from './components/WellnessTracker';
import Calendar from './components/Calendar';
import InviteTeam from './components/InviteTeam';
import SecuritySettings from './components/settings/SecuritySettings';
import UserSettings from './components/settings/UserSettings';
import UserManagement from './components/settings/UserManagement';
import NotificationsPage from './components/NotificationsPage';

const App: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return <LoadingSpinner />;
  }

  // Pages publiques qui ne nécessitent pas la barre latérale
  const publicPages = ['/login', '/signup', '/forgot-password'];
  const isPublicPage = publicPages.includes(location.pathname);

  if (!currentUser && !isPublicPage) {
    return <Navigate to="/login" replace />;
  }

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto pl-64">
        <div className="p-6">
          <Routes>
            {/* Routes principales */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } />
            <Route path="/workload" element={
              <ProtectedRoute>
                <WorkloadManager />
              </ProtectedRoute>
            } />

            {/* Routes Analytics */}
            <Route path="/performance-analytics" element={
              <ProtectedRoute>
                <PerformanceMetrics member={userProfile} timeframe="week" />
              </ProtectedRoute>
            } />
            <Route path="/resource-analytics" element={
              <ProtectedRoute>
                <ResourceUtilization members={[]} timeframe="week" />
              </ProtectedRoute>
            } />
            <Route path="/budget-analytics" element={
              <ProtectedRoute>
                <BudgetAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/team-analytics" element={
              <ProtectedRoute>
                <TeamAnalytics members={[]} timeframe="week" />
              </ProtectedRoute>
            } />
            <Route path="/project-analytics" element={
              <ProtectedRoute>
                <ProjectAnalytics project={{}} />
              </ProtectedRoute>
            } />
            <Route path="/ai-analytics" element={
              <ProtectedRoute>
                <AIAnalytics insights={[]} />
              </ProtectedRoute>
            } />

            {/* Routes Fonctionnalités */}
            <Route path="/gamification" element={
              <ProtectedRoute>
                <GamificationHub />
              </ProtectedRoute>
            } />
            <Route path="/career" element={
              <ProtectedRoute>
                <CareerDevelopment />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute>
                <FeedbackSystem />
              </ProtectedRoute>
            } />
            <Route path="/wellness" element={
              <ProtectedRoute>
                {userProfile && (
                  <WellnessTracker employeeId={userProfile.uid} surveys={[]} onSubmitSurvey={() => {}} />
                )}
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />

            {/* Route des notifications */}
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />

            {/* Routes Paramètres */}
            <Route path="/settings/user" element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } />
            <Route path="/settings/security" element={
              <ProtectedRoute>
                <SecuritySettings />
              </ProtectedRoute>
            } />
            <Route path="/settings/users" element={
              <ProtectedRoute requiredRole="superadmin">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/invite" element={
              <ProtectedRoute>
                <InviteTeam />
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;