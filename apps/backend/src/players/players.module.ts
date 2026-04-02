import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { REPOSITORIES, QUERIES } from './players.provider';

@Module({
  imports: [],
  controllers: [PlayersController],
  providers: [...REPOSITORIES, ...QUERIES],
})
export class PlayersModule {}
