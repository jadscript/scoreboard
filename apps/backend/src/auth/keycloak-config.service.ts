import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PolicyEnforcementMode,
  TokenValidation,
  type KeycloakConnectOptions,
  type KeycloakConnectOptionsFactory,
} from 'nest-keycloak-connect';
import type { AuthConfig } from '../config/auth.config';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    const cfg = this.configService.get<AuthConfig>('auth')!;
    const policyEnforcement =
      cfg.policyEnforcement === 'enforcing'
        ? PolicyEnforcementMode.ENFORCING
        : PolicyEnforcementMode.PERMISSIVE;
    const tokenValidation =
      cfg.tokenValidation === 'offline'
        ? TokenValidation.OFFLINE
        : TokenValidation.ONLINE;

    return {
      authServerUrl: cfg.authServerUrl,
      realm: cfg.realm,
      clientId: cfg.clientId,
      secret: cfg.secret,
      bearerOnly: true,
      policyEnforcement,
      tokenValidation,
    };
  }
}
