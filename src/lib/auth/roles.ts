/**
 * Authentication Roles & Permissions (Edge Runtime Compatible)
 *
 * This file contains ONLY types and enums with zero Node.js dependencies,
 * making it safe to import from middleware and other Edge contexts.
 *
 * @file src/lib/auth/roles.ts
 */

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
  SERVICE = "service",
}

export interface RolePermissions {
  [UserRole.ADMIN]: string[];
  [UserRole.USER]: string[];
  [UserRole.GUEST]: string[];
  [UserRole.SERVICE]: string[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [
    "alchemical:*",
    "kitchen:*",
    "analytics:*",
    "user:*",
    "system:*",
  ],
  [UserRole.USER]: [
    "alchemical:calculate",
    "alchemical:planetary",
    "kitchen:recommend",
    "kitchen:recipes:read",
    "user:profile:read",
    "user:profile:update",
  ],
  [UserRole.GUEST]: [
    "alchemical:calculate:basic",
    "kitchen:recipes:read:public",
    "kitchen:recommend:limited",
  ],
  [UserRole.SERVICE]: [
    "alchemical:calculate",
    "kitchen:recommend",
    "analytics:write",
  ],
};
