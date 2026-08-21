/**
 * Color Palette for Tasky
 * Clean, modern Slate & Ocean Blue theme.
 */

export const Colors = {
  // Brand & Accent Colors (Ocean Blue)
  primary: '#2563EB',        // Ocean Blue - Primary actions, active highlights
  primaryDark: '#1E40AF',    // Deep Blue
  primaryHover: '#1D4ED8',   // Pressed state
  primaryMedium: '#3B82F6',  // Medium Accent
  primaryLight: '#EFF6FF',   // Soft ice-blue background tint
  primaryMuted: '#93C5FD',   // Muted blue for borders

  // Neutral Backgrounds & Surfaces
  appBackground: '#F8FAFC',  // Clean Slate-50 Background
  background: '#F8FAFC',     // Clean slate-50 background
  card: '#FFFFFF',           // Pure white surface
  cardAlt: '#F1F5F9',        // Slate-100 secondary surface
  cardHover: '#F8FAFC',      // Highlighted card state

  // Borders & Dividers
  border: '#E2E8F0',         // Crisp subtle border (slate-200)
  borderLight: '#F1F5F9',    // Very light separator (slate-100)
  borderFocus: '#2563EB',    // Active input border

  // Typography Colors
  textPrimary: '#0F172A',    // High-contrast deep slate (slate-900)
  textSecondary: '#475569',  // Medium slate for body & labels (slate-600)
  textMuted: '#94A3B8',      // Soft slate for timestamps, placeholders (slate-400)
  textInverse: '#FFFFFF',    // White text on dark/primary backgrounds

  // Action Buttons / Icons
  iconBtnBg: '#F1F5F9',
  iconBtnPressed: '#E2E8F0',

  // Priority Colors
  priority: {
    High: {
      text: '#DC2626',
      bg: '#FEE2E2',
      border: '#FECACA',
      badge: '#EF4444',
    },
    Medium: {
      text: '#D97706',
      bg: '#FEF3C7',
      border: '#FDE68A',
      badge: '#F59E0B',
    },
    Low: {
      text: '#059669',
      bg: '#D1FAE5',
      border: '#A7F3D0',
      badge: '#10B981',
    },
  },

  // Status & Urgency Colors
  status: {
    completed: {
      text: '#16A34A',
      bg: '#DCFCE7',
      border: '#BBF7D0',
    },
    pending: {
      text: '#64748B',
      bg: '#F1F5F9',
      border: '#E2E8F0',
    },
    overdue: {
      text: '#E11D48',
      bg: '#FFE4E6',
      border: '#FECDD3',
    },
    dueToday: {
      text: '#EA580C',
      bg: '#FFEDD5',
      border: '#FED7AA',
    },
    dueTomorrow: {
      text: '#D97706',
      bg: '#FEF3C7',
      border: '#FDE68A',
    },
    dueSoon: {
      text: '#2563EB',
      bg: '#DBEAFE',
      border: '#BFDBFE',
    },
  },

  // System UI Feedback
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  // Shadows
  shadow: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export default Colors;
