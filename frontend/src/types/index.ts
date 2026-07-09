// ─── Shared Application Types ─────────────────────────────────────────────────
// Single source of truth for all TypeScript types used across modules.
// Import from here: import { AppPage } from '../../types';

export type AppPage = 'home' | 'login' | 'register' | 'pricing' | 'contact' | 'dashboard' | 'team-member' | 'blog';

export interface CoreSettings {
  color: 'cyan' | 'pink' | 'green' | 'amber';
  geometry: 'sphere' | 'torusKnot' | 'dodecahedron' | 'tetrahedron';
  mode: 'ORBIT' | 'QUANTUM' | 'NEURAL' | 'WAVE';
  speedMultiplier: number;
  particleCount: number;
  noiseIntensity: number;
  autoRotate: boolean;
  wireframe: boolean;
  soundEnabled: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'system' | 'output' | 'error' | 'success';
  text: string;
  timestamp: string;
}

export interface AcademicModule {
  id: string;
  code: string;
  name: string;
  category: string;
  credits: number;
  progress: number;
  status: 'Completed' | 'In Progress' | 'Locked';
  intelRating: number;
  instructor: string;
}

export interface TelemetryLog {
  id: string;
  tag: string;
  message: string;
  status: 'info' | 'warn' | 'alert' | 'success';
  time: string;
}

export type ThemePreset = {
  primary: string;
  secondary: string;
  primaryGlow: string;
  accent: string;
  hex: string;
};

// Auth types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'educator';
  agreeTerms: boolean;
}
