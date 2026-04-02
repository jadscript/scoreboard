import { GetPlayerByUserIdHandler } from '@scoreboard/core/application/queries/get-player-by-user-id/get-player-by-user-id.query';
import type { IPlayerRepository } from '@scoreboard/core/infrastructure/database/player-repository.interface';
import { PrismaPlayerRepository } from './prisma-player.repository';
import { CreatePlayerHandler } from '@scoreboard/core/application/commands/create-player/create-player.command';

const PLAYER_REPOSITORY = 'PLAYER_REPOSITORY';

const REPOSITORIES = [
  {
    provide: PLAYER_REPOSITORY,
    useClass: PrismaPlayerRepository,
  },
];

const COMMANDS = [
  {
    provide: CreatePlayerHandler,
    useFactory: (playerRepository: IPlayerRepository) =>
      new CreatePlayerHandler(playerRepository),
    inject: [PLAYER_REPOSITORY],
  },
];

const QUERIES = [
  {
    provide: GetPlayerByUserIdHandler,
    useFactory: (playerRepository: IPlayerRepository) =>
      new GetPlayerByUserIdHandler(playerRepository),
    inject: [PLAYER_REPOSITORY],
  },
];

export { REPOSITORIES, QUERIES, COMMANDS };
