import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const defaultLocalUrl =
  'postgresql://postgres:postgres@127.0.0.1:5432/scoreboard_dev';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? defaultLocalUrl,
  },
});
