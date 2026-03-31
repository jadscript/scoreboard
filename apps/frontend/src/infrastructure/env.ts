import Joi from 'joi'

interface Env {
  VITE_KEYCLOAK_URL: string
  VITE_KEYCLOAK_REALM: string
  VITE_KEYCLOAK_CLIENT: string
}

const schema = Joi.object<Env>({
  VITE_KEYCLOAK_URL: Joi.string().uri().required(),
  VITE_KEYCLOAK_REALM: Joi.string().min(1).required(),
  VITE_KEYCLOAK_CLIENT: Joi.string().min(1).required(),
}).unknown(true)

const { error, value } = schema.validate(import.meta.env, { abortEarly: false })

if (error) {
  const details = error.details.map((d) => `  - ${d.message}`).join('\n')
  throw new Error(
    `[env] Missing or invalid environment variables:\n${details}\n\nCheck your .env file against .env.example.`,
  )
}

export const env: Env = {
  VITE_KEYCLOAK_URL: value.VITE_KEYCLOAK_URL,
  VITE_KEYCLOAK_REALM: value.VITE_KEYCLOAK_REALM,
  VITE_KEYCLOAK_CLIENT: value.VITE_KEYCLOAK_CLIENT,
}
