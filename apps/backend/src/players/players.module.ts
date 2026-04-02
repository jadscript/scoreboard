import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { REPOSITORIES, QUERIES, COMMANDS } from './players.provider';

@Module({
  imports: [],
  controllers: [PlayersController],
  providers: [...REPOSITORIES, ...QUERIES, ...COMMANDS],
})
export class PlayersModule {}
