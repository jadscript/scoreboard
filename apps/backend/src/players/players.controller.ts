import {
  Controller,
  Get,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakUser } from 'nest-keycloak-connect';
import { GetPlayerByUserIdHandler } from '@scoreboard/core/application/queries/get-player-by-user-id/get-player-by-user-id.query';

interface AccessTokenPayload {
  sub?: string;
}

@Controller('players')
export class PlayersController {
  constructor(
    private readonly getPlayerByUserIdHandler: GetPlayerByUserIdHandler,
  ) {}

  @Get('/me')
  async getMe(@KeycloakUser() user: AccessTokenPayload) {
    const userId = user.sub;
    if (!userId) {
      throw new UnauthorizedException('Access token without subject');
    }

    const player = await this.getPlayerByUserIdHandler.execute({
      userId,
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }
}
