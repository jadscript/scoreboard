import { IPlayerRepository } from '@scoreboard/core/infrastructure/database/player-repository.interface';
import { Player } from 'src/generated/prisma/client';
import { Player as DomainPlayer } from '@scoreboard/core/domain/player.entity';
import { PrismaService } from 'src/prisma/prisma.service';

export class PrismaPlayerRepository implements IPlayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DomainPlayer[]> {
    const players = await this.prisma.player.findMany();
    return players.map((player) => this.toDomain(player));
  }

  async findById(id: string): Promise<DomainPlayer | null> {
    const player = await this.prisma.player.findUnique({
      where: { id },
    });
    return player ? this.toDomain(player) : null;
  }

  async findByUserId(userId: string): Promise<DomainPlayer | null> {
    const player = await this.prisma.player.findUnique({
      where: { userId },
    });
    return player ? this.toDomain(player) : null;
  }

  async findManyByIds(ids: string[]): Promise<DomainPlayer[]> {
    const players = await this.prisma.player.findMany({
      where: { id: { in: ids } },
    });
    return players.map((player) => this.toDomain(player));
  }

  async save(player: Player): Promise<void> {
    await this.prisma.player.create({ data: player });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.player.delete({ where: { id } });
  }

  toDomain(player: Player): DomainPlayer {
    return DomainPlayer.restore(
      player.id,
      player.name,
      player.userId,
      player.gender,
      player.whatsapp,
      player.photoUrl,
    );
  }
}
