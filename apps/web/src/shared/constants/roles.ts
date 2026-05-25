import type { UserRole } from '../types/user.types';

// ─── Role Display Metadata ────────────────────────────────────────────────────

export interface RoleMeta {
  label: string;
  description: string;
  color: string;            // Tailwind color class for badge
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access including user management and simulation control',
    color: 'text-purple-400 bg-purple-400/10 ring-purple-400/20',
  },
  operations_manager: {
    label: 'Operations Manager',
    description: 'Full operational access; can run simulations and view all logs',
    color: 'text-brand-400 bg-brand-400/10 ring-brand-400/20',
  },
  security_officer: {
    label: 'Security Officer',
    description: 'Can create and acknowledge security-related incidents',
    color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20',
  },
  medical_staff: {
    label: 'Medical Staff',
    description: 'Can create medical incidents; read-only on other data',
    color: 'text-green-400 bg-green-400/10 ring-green-400/20',
  },
  zone_marshal: {
    label: 'Zone Marshal',
    description: 'Can report incidents in assigned zones',
    color: 'text-orange-400 bg-orange-400/10 ring-orange-400/20',
  },
  read_only: {
    label: 'Read Only',
    description: 'Dashboard and audit log view access only',
    color: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  },
};

export const ALL_ROLES: UserRole[] = [
  'super_admin',
  'operations_manager',
  'security_officer',
  'medical_staff',
  'zone_marshal',
  'read_only',
];
