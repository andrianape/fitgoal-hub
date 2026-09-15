import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionalProfile } from '../professionals/entities/professional-profile.entity';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { AvailabilitySlot } from './entities/availability-slot.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(AvailabilitySlot)
    private readonly slotRepository: Repository<AvailabilitySlot>,

    @InjectRepository(ProfessionalProfile)
    private readonly profileRepository: Repository<ProfessionalProfile>,
  ) {}

  async findAvailableByProfessional(
    professionalId: number,
  ): Promise<AvailabilitySlot[]> {
    const professional = await this.profileRepository.findOneBy({
      id: professionalId,
      isVerified: true,
    });

    if (!professional) {
      throw new NotFoundException(
        'Verifikovani profesionalni profil ne postoji.',
      );
    }

    return this.slotRepository
      .createQueryBuilder('slot')
      .where('slot.professionalId = :professionalId', {
        professionalId,
      })
      .andWhere('slot.isBooked = :isBooked', {
        isBooked: false,
      })
      .andWhere('slot.startsAt > :now', {
        now: new Date(),
      })
      .orderBy('slot.startsAt', 'ASC')
      .getMany();
  }

  async findOwn(userId: number): Promise<AvailabilitySlot[]> {
    const profile = await this.findProfileByUserId(userId);

    return this.slotRepository.find({
      where: {
        professional: {
          id: profile.id,
        },
      },
      order: {
        startsAt: 'ASC',
      },
    });
  }

  async create(
    userId: number,
    dto: CreateAvailabilitySlotDto,
  ): Promise<AvailabilitySlot> {
    const profile = await this.findProfileByUserId(userId);

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    const now = new Date();

    if (startsAt <= now) {
      throw new BadRequestException('Početak termina mora biti u budućnosti.');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('Kraj termina mora biti posle početka.');
    }

    const durationInMilliseconds = endsAt.getTime() - startsAt.getTime();

    const maximumDuration = 8 * 60 * 60 * 1000;

    if (durationInMilliseconds > maximumDuration) {
      throw new BadRequestException('Termin ne može trajati duže od 8 sati.');
    }

    const overlappingSlot = await this.slotRepository
      .createQueryBuilder('slot')
      .where('slot.professionalId = :professionalId', {
        professionalId: profile.id,
      })
      .andWhere('slot.startsAt < :endsAt', {
        endsAt,
      })
      .andWhere('slot.endsAt > :startsAt', {
        startsAt,
      })
      .getOne();

    if (overlappingSlot) {
      throw new ConflictException(
        'Ovaj termin se preklapa sa postojećim terminom.',
      );
    }

    const slot = this.slotRepository.create({
      professional: profile,
      startsAt,
      endsAt,
      isBooked: false,
    });

    return this.slotRepository.save(slot);
  }

  async remove(userId: number, slotId: number): Promise<void> {
    const profile = await this.findProfileByUserId(userId);

    const slot = await this.slotRepository.findOne({
      where: {
        id: slotId,
        professional: {
          id: profile.id,
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Slobodan termin ne postoji.');
    }

    if (slot.isBooked) {
      throw new ConflictException('Rezervisan termin ne može biti obrisan.');
    }

    await this.slotRepository.remove(slot);
  }

  private async findProfileByUserId(
    userId: number,
  ): Promise<ProfessionalProfile> {
    const profile = await this.profileRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Nemate napravljen profesionalni profil.');
    }

    return profile;
  }
}
