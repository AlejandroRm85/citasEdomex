// src/theme/colors.ts
// Paleta institucional Poder Judicial Estado de México

export const Colors = {
  // Verde institucional Edomex
  primary:        '#1B5E20',
  primaryLight:   '#2E7D32',
  primaryPale:    '#E8F5E9',
  primaryMid:     '#388E3C',

  // Rojo Edomex
  danger:         '#B71C1C',
  dangerLight:    '#FFEBEE',

  // Dorado Edomex
  gold:           '#F9A825',
  goldPale:       '#FFF8E1',

  // Neutros
  background:     '#F5F5F5',
  surface:        '#FFFFFF',
  border:         '#E0E0E0',
  borderMid:      '#BDBDBD',

  // Texto
  textPrimary:    '#1A1A1A',
  textSecondary:  '#616161',
  textMuted:      '#9E9E9E',
  textOnPrimary:  '#FFFFFF',

  // Estados de cita
  statusProgramada: '#2E7D32',
  statusCompletada: '#1565C0',
  statusCancelada:  '#B71C1C',

  // Sombras
  shadow:         'rgba(0,0,0,0.08)',
} as const;

export const Typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, color: Colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 17, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: Colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400' as const, color: Colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;
