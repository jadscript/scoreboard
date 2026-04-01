import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const appCfg = configService.get<AppConfig>('app')!;

  if (appCfg.corsEnabled) {
    app.enableCors({
      origin: appCfg.corsOrigins,
      credentials: true,
    });
  }

  await app.listen(appCfg.port);
}

void bootstrap();
