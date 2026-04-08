import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakUser } from 'nest-keycloak-connect';
import { GetPlayerByUserIdHandler } from '@scoreboard/core/application/queries/get-player-by-user-id/get-player-by-user-id.query';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { CreatePlayerHandler } from '@scoreboard/core/application/commands/create-player/create-player.command';
import { Gender } from '@scoreboard/core/domain/player.entity';
import { Logger } from '@nestjs/common';

interface AccessTokenPayload {
  sub?: string;
}

@Controller('players')
export class PlayersController {
  private readonly logger = new Logger(PlayersController.name);
  constructor(
    private readonly getPlayerByUserIdHandler: GetPlayerByUserIdHandler,
    private readonly createPlayerHandler: CreatePlayerHandler,
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

    return player;
  }

  @Get('by-user-id/:userId')
  async getByUserId(@Param('userId') userId: string) {
    this.logger.log(`Getting player by user ID: ${userId}`);
    const player = await this.getPlayerByUserIdHandler.execute({ userId });
    return player;
  }

  @Post()
  async create(
    @Body() body: CreatePlayerDto,
    @KeycloakUser() user: AccessTokenPayload,
  ) {
    const userId = user.sub;
    if (!userId) {
      throw new UnauthorizedException('Access token without subject');
    }
    const player = await this.createPlayerHandler.execute({
      name: body.name,
      gender: body.gender as unknown as Gender,
      userId: userId,
    });
    return player;
  }
}
