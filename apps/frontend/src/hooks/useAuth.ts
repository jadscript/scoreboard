import { useContext } from 'react'
import { AuthContext } from '../infrastructure/auth/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context.keycloak) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
