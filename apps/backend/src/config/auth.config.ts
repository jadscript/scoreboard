import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  authServerUrl: (process.env.KEYCLOAK_URL ?? '').replace(/\/+$/, ''),
  realm: process.env.KEYCLOAK_REALM ?? '',
  clientId: process.env.KEYCLOAK_CLIENT_ID ?? '',
  secret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
  policyEnforcement:
    (process.env.KEYCLOAK_POLICY_ENFORCEMENT ?? 'permissive') === 'enforcing'
      ? 'enforcing'
      : 'permissive',
  tokenValidation:
    (process.env.KEYCLOAK_TOKEN_VALIDATION ?? 'online') === 'offline'
      ? 'offline'
      : 'online',
}));

export type AuthConfig = ReturnType<typeof authConfig>;
