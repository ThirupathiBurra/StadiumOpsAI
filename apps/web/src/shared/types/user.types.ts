import type { Timestamp } from 'firebase/firestore';

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'operations_manager'
  | 'security_officer'
  | 'medical_staff'
  | 'zone_marshal'
  | 'read_only';

export interface StadiumUser {
  uid: string;                     // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  assignedZones: string[];         // Zone IDs this user is responsible for
  department: string;
  badgeId?: string;
  isActive: boolean;
  lastLoginAt: Timestamp;
  createdAt: Timestamp;
  createdBy: string;               // UID of admin who created the account
}

// ─── Role Permissions ─────────────────────────────────────────────────────────

export interface RolePermissions {
  canCreateIncident: boolean;
  canAcknowledgeAlert: boolean;
  canResolveIncident: boolean;
  canManageUsers: boolean;
  canRunSimulation: boolean;
  canViewAuditLogs: boolean;
  canAccessAIConsole: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    canCreateIncident: true,
    canAcknowledgeAlert: true,
    canResolveIncident: true,
    canManageUsers: true,
    canRunSimulation: true,
    canViewAuditLogs: true,
    canAccessAIConsole: true,
  },
  operations_manager: {
    canCreateIncident: true,
    canAcknowledgeAlert: true,
    canResolveIncident: true,
    canManageUsers: false,
    canRunSimulation: true,
    canViewAuditLogs: true,
    canAccessAIConsole: true,
  },
  security_officer: {
    canCreateIncident: true,
    canAcknowledgeAlert: true,
    canResolveIncident: false,
    canManageUsers: false,
    canRunSimulation: false,
    canViewAuditLogs: false,
    canAccessAIConsole: true,
  },
  medical_staff: {
    canCreateIncident: true,
    canAcknowledgeAlert: false,
    canResolveIncident: false,
    canManageUsers: false,
    canRunSimulation: false,
    canViewAuditLogs: false,
    canAccessAIConsole: false,
  },
  zone_marshal: {
    canCreateIncident: true,
    canAcknowledgeAlert: false,
    canResolveIncident: false,
    canManageUsers: false,
    canRunSimulation: false,
    canViewAuditLogs: false,
    canAccessAIConsole: false,
  },
  read_only: {
    canCreateIncident: false,
    canAcknowledgeAlert: false,
    canResolveIncident: false,
    canManageUsers: false,
    canRunSimulation: false,
    canViewAuditLogs: true,
    canAccessAIConsole: false,
  },
};
