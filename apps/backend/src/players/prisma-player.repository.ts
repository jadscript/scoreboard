import { Injectable } from '@nestjs/common';
import { Player } from '@scoreboard/core/domain/player.entity';
import type { IPlayerRepository } from '@scoreboard/core/infrastructure/database/player-repository.interface';
import type { Gender } from '@scoreboard/core/domain/shared/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaPlayerRepository implements IPlayerRepository {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Player[]> {
    const records = await this.prisma.player.findMany();
    return records.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Player | null> {
    const record = await this.prisma.player.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    const record = await this.prisma.player.findUnique({ where: { userId } });
    return record ? this.toDomain(record) : null;
  }

  async findManyByIds(ids: string[]): Promise<Player[]> {
    const records = await this.prisma.player.findMany({
      where: { id: { in: ids } },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(player: Player): Promise<void> {
    const data = {
      name: player.name,
      userId: player.userId,
      gender: player.gender,
      whatsapp: player.whatsapp,
      photoUrl: player.photoUrl,
    };
    await this.prisma.player.upsert({
      where: { id: player.id },
      update: data,
      create: { id: player.id, ...data },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.player.delete({ where: { id } });
  }

  private toDomain(record: {
    id: string;
    name: string;
    userId: string;
    gender: string;
    whatsapp: string | null;
    photoUrl: string | null;
  }): Player {
    return Player.restore(
      record.id,
      record.name,
      record.userId,
      record.gender as Gender,
      record.whatsapp,
      record.photoUrl,
    );
  }
}
