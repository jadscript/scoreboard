/**
 * Ensures Joi validation in ConfigModule passes when e2e boots AppModule
 * (no .env file is loaded in the default Jest e2e environment).
 */
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@127.0.0.1:5432/scoreboard_test';
process.env.KEYCLOAK_URL ??= 'http://127.0.0.1:8080';
process.env.KEYCLOAK_REALM ??= 'scoreboard';
process.env.KEYCLOAK_CLIENT_ID ??= 'api-cli';
process.env.KEYCLOAK_CLIENT_SECRET ??= 'e2e-test-placeholder-secret';
