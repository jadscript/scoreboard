import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  CORS_ENABLED: Joi.boolean().default(true),

  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),

  KEYCLOAK_URL: Joi.string().uri().required(),

  KEYCLOAK_REALM: Joi.string().min(1).required(),

  KEYCLOAK_CLIENT_ID: Joi.string().min(1).required(),

  KEYCLOAK_CLIENT_SECRET: Joi.string().min(1).required(),

  KEYCLOAK_POLICY_ENFORCEMENT: Joi.string()
    .valid('permissive', 'enforcing')
    .default('permissive'),

  KEYCLOAK_TOKEN_VALIDATION: Joi.string()
    .valid('online', 'offline')
    .default('online'),
});
