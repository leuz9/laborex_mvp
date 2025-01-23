export type UserRole = 'admin' | 'manager' | 'team_lead' | 'developer' | 'viewer' | 'superadmin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  teamId?: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
  avatar?: string;
  location?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  points?: number;
  level?: number;
  badges?: any[];
  streak?: {
    current: number;
    longest: number;
    lastActive: string;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  updatedAt?: string;
}

export const ROLE_PERMISSIONS = {
  superadmin: [
    'manage_users',
    'manage_roles',
    'manage_teams',
    'manage_projects',
    'view_analytics',
    'manage_settings',
    'manage_billing',
    'manage_gamification'
  ],
  admin: [
    'manage_users',
    'manage_roles',
    'manage_teams',
    'manage_projects',
    'view_analytics',
    'manage_settings',
    'manage_billing',
    'manage_gamification'
  ],
  manager: [
    'manage_teams',
    'manage_projects',
    'view_analytics',
    'manage_resources',
    'approve_timesheets',
    'view_gamification'
  ],
  team_lead: [
    'manage_team_projects',
    'assign_tasks',
    'view_team_analytics',
    'manage_team_resources',
    'view_gamification'
  ],
  developer: [
    'view_projects',
    'manage_tasks',
    'submit_timesheets',
    'view_personal_analytics',
    'view_gamification'
  ],
  viewer: [
    'view_projects',
    'view_analytics',
    'view_feedback',
    'submit_feedback',
    'view_gamification'
  ]
} as const;