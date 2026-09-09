import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { ProfessionalProfile } from './entities/professional-profile.entity';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(ProfessionalProfile)
    private readonly profileRepository:
      Repository<ProfessionalProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<ProfessionalProfile[]> {
    return this.profileRepository.find({
      where: {
        isVerified: true,
      },
      relations: {
        user: {
          city: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<ProfessionalProfile> {
    const profile = await this.profileRepository.findOne({
      where: {
        id,
        isVerified: true,
      },
      relations: {
        user: {
          city: true,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        `Profesionalni profil sa ID vrednošću ${id} ne postoji.`,
      );
    }

    return profile;
  }

  async findOwn(
    userId: number,
  ): Promise<ProfessionalProfile> {
    const profile = await this.profileRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: {
          city: true,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Nemate napravljen profesionalni profil.',
      );
    }

    return profile;
  }

  async create(
    userId: number,
    dto: CreateProfessionalProfileDto,
  ): Promise<ProfessionalProfile> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException(
        'Korisnički nalog ne postoji.',
      );
    }

    const existingProfile =
      await this.profileRepository.findOne({
        where: {
          user: {
            id: userId,
          },
        },
      });

    if (existingProfile) {
      throw new ConflictException(
        'Već imate napravljen profesionalni profil.',
      );
    }

    const profile = this.profileRepository.create({
      user,
      biography: dto.biography.trim(),
      yearsOfExperience: dto.yearsOfExperience,
      pricePerSession: dto.pricePerSession,
      specialties: dto.specialties.map((specialty) =>
        specialty.trim(),
      ),
      isVerified: false,
    });

    const savedProfile =
      await this.profileRepository.save(profile);

    return this.findOwn(savedProfile.user.id);
  }

  async update(
    userId: number,
    dto: UpdateProfessionalProfileDto,
  ): Promise<ProfessionalProfile> {
    const profile = await this.findOwn(userId);

    if (dto.biography !== undefined) {
      profile.biography = dto.biography.trim();
    }

    if (dto.yearsOfExperience !== undefined) {
      profile.yearsOfExperience =
        dto.yearsOfExperience;
    }

    if (dto.pricePerSession !== undefined) {
      profile.pricePerSession = dto.pricePerSession;
    }

    if (dto.specialties !== undefined) {
      profile.specialties = dto.specialties.map(
        (specialty) => specialty.trim(),
      );
    }

    profile.isVerified = false;

    await this.profileRepository.save(profile);

    return this.findOwn(userId);
  }

  async updateVerification(
    id: number,
    isVerified: boolean,
  ): Promise<ProfessionalProfile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: {
        user: {
          city: true,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        `Profesionalni profil sa ID vrednošću ${id} ne postoji.`,
      );
    }

    profile.isVerified = isVerified;

    return this.profileRepository.save(profile);
  }
}