import { GetPlayerByUserIdHandler } from '@scoreboard/core/application/queries/get-player-by-user-id/get-player-by-user-id.query';
import type { IPlayerRepository } from '@scoreboard/core/infrastructure/database/player-repository.interface';
import { PrismaPlayerRepository } from './prisma-player.repository';

const PLAYER_REPOSITORY = 'PLAYER_REPOSITORY';

const REPOSITORIES = [
  {
    provide: PLAYER_REPOSITORY,
    useClass: PrismaPlayerRepository,
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

export { REPOSITORIES, QUERIES };
