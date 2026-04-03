import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type Keycloak from 'keycloak-js'
import { keycloak } from './keycloak'
import { AuthContext, AUTH_CONTEXT_DEFAULT } from './AuthContext'
import type { AuthContextValue, AuthUser } from './AuthContext'

const TOKEN_REFRESH_INTERVAL_MS = 60_000
const TOKEN_MIN_VALIDITY_PROACTIVE = 70
const TOKEN_MIN_VALIDITY_REACTIVE = 30

function extractUser(kc: Keycloak): AuthUser {
  const parsed = kc.tokenParsed as Record<string, unknown> | undefined
  const firstName = (parsed?.['given_name'] as string | undefined) ?? undefined
  const lastName = (parsed?.['family_name'] as string | undefined) ?? undefined
  const fullName = (parsed?.['name'] as string | undefined) ?? [firstName, lastName].filter(Boolean).join(' ')

  return {
    email: (parsed?.['email'] as string | undefined) ?? undefined,
    firstName,
    lastName,
    fullName,
    username: (parsed?.['preferred_username'] as string | undefined) ?? undefined,
  }
}

function extractResourceRoles(kc: Keycloak): Record<string, string[]> {
  const access = kc.resourceAccess
  if (!access) return {}

  const result: Record<string, string[]> = {}
  for (const [resource, value] of Object.entries(access)) {
    result[resource] = value.roles ?? []
  }
  return result
}

function buildContextValue(kc: Keycloak): AuthContextValue {
  const roles = kc.realmAccess?.roles ?? []
  const resourceRoles = extractResourceRoles(kc)

  return {
    authenticated: kc.authenticated ?? false,
    token: kc.token,
    user: extractUser(kc),
    roles,
    resourceRoles,
    keycloak: kc,
    logout: () => kc.logout(),
    hasRole: (role: string) => roles.includes(role),
    hasResourceRole: (role: string, resource?: string) => {
      if (resource) return resourceRoles[resource]?.includes(role) ?? false
      return Object.values(resourceRoles).some((r) => r.includes(role))
    },
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider(props: AuthProviderProps) {
  const [state, setState] = useState<'loading' | 'authenticated' | 'error'>('loading')
  const [contextValue, setContextValue] = useState<AuthContextValue>(AUTH_CONTEXT_DEFAULT)

  const refreshToken = useCallback(async (minValidity: number) => {
    try {
      const refreshed = await keycloak.updateToken(minValidity)
      if (refreshed) {
        setContextValue(buildContextValue(keycloak))
      }
    } catch {
      keycloak.login()
    }
  }, [])

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && keycloak.authenticated) {
        refreshToken(TOKEN_MIN_VALIDITY_REACTIVE)
      }
    }

    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((authenticated) => {
        if (!authenticated) {
          keycloak.login()
          return
        }

        setContextValue(buildContextValue(keycloak))
        setState('authenticated')

        keycloak.onTokenExpired = () => {
          refreshToken(TOKEN_MIN_VALIDITY_REACTIVE)
        }

        intervalId = setInterval(() => {
          refreshToken(TOKEN_MIN_VALIDITY_PROACTIVE)
        }, TOKEN_REFRESH_INTERVAL_MS)

        document.addEventListener('visibilitychange', handleVisibilityChange)
      })
      .catch(() => {
        setState('error')
      })

    return () => {
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      keycloak.onTokenExpired = undefined
    }
  }, [refreshToken])

  if (state === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-lg">Carregando...</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-white">
        <p className="text-lg">Falha ao conectar com o servidor de autenticação.</p>
        <button
          type="button"
          className="rounded-none bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  )
}
