import { createContext } from 'react'
import type Keycloak from 'keycloak-js'
import { keycloak } from './keycloak'

export interface AuthUser {
  email: string | undefined
  firstName: string | undefined
  lastName: string | undefined
  fullName: string
  username: string | undefined
}

export interface AuthContextValue {
  authenticated: boolean
  token: string | undefined
  user: AuthUser
  roles: string[]
  resourceRoles: Record<string, string[]>
  keycloak: Keycloak
  logout: () => void
  hasRole: (role: string) => boolean
  hasResourceRole: (role: string, resource?: string) => boolean
}

export const AUTH_CONTEXT_DEFAULT: AuthContextValue = {
  authenticated: false,
  token: undefined,
  user: { email: undefined, firstName: undefined, lastName: undefined, fullName: '', username: undefined },
  roles: [],
  resourceRoles: {},
  keycloak,
  logout: () => {},
  hasRole: () => false,
  hasResourceRole: () => false,
}

export const AuthContext = createContext<AuthContextValue>(AUTH_CONTEXT_DEFAULT)
