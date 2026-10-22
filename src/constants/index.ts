import {
  Shield,
  Terminal,
  Cpu,
  Network,
  Activity,
  Code2,
  Eye,
  Sparkles,
  Wifi
} from 'lucide-react';

export const STORAGE_KEY = 'npl_cyber_portfolio_cms_v1';

// Helper to map icon string to component
export const ICON_MAP = {
  Shield,
  Code2,
  Cpu,
  Sparkles,
  Eye,
  Wifi,
  Terminal,
  Network,
  Activity
};

export const THEME_CONFIG = {
  cyan: {
    accent: 'from-cyan-400 to-blue-500',
    glow: 'rgba(0, 243, 255, 0.25)'
  },
  emerald: {
    accent: 'from-emerald-400 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.25)'
  },
  purple: {
    accent: 'from-purple-400 to-fuchsia-500',
    glow: 'rgba(168, 85, 247, 0.25)'
  },
  sky: {
    accent: 'from-sky-400 to-indigo-500',
    glow: 'rgba(56, 189, 248, 0.25)'
  }
};
