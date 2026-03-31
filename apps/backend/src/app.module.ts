import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { validationSchema } from './config/validation.schema';
import { OnModuleInit } from '@nestjs/common';
import { AppConfig } from './config/app.config';
import { Logger } from '@nestjs/common';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env',
      ],
      load: [appConfig, databaseConfig],
      validationSchema,
    }),
    PlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    const appConfig = this.configService.get<AppConfig>('app')!;
    this.logger.log(`Backend running on port ${appConfig.port}`);
    this.logger.log(`CORS enabled: ${appConfig.corsEnabled}`);
    this.logger.log(`CORS origins: ${appConfig.corsOrigins.join(', ')}`);
  }
}
