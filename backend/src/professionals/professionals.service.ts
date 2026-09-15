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
import { FilterProfessionalsDto } from './dto/filter-professionals.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(ProfessionalProfile)
    private readonly profileRepository: Repository<ProfessionalProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(filters: FilterProfessionalsDto) {
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const query = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.city', 'city')
      .where('profile.isVerified = :isVerified', {
        isVerified: true,
      });

    if (filters.role !== undefined) {
      query.andWhere('user.role = :role', {
        role: filters.role,
      });
    }

    if (filters.cityId !== undefined) {
      query.andWhere('city.id = :cityId', {
        cityId: filters.cityId,
      });
    }

    if (filters.specialty !== undefined) {
      query.andWhere(
        `EXISTS (
        SELECT 1
        FROM unnest(profile.specialties) AS specialty
        WHERE LOWER(specialty) LIKE LOWER(:specialty)
      )`,
        {
          specialty: `%${filters.specialty.trim()}%`,
        },
      );
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('profile.pricePerSession <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.search !== undefined) {
      const search = `%${filters.search.trim()}%`;

      query.andWhere(
        `(
        LOWER(user.firstName) LIKE LOWER(:search)
        OR LOWER(user.lastName) LIKE LOWER(:search)
        OR LOWER(CONCAT(user.firstName, ' ', user.lastName))
          LIKE LOWER(:search)
      )`,
        { search },
      );
    }

    query.orderBy('profile.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  async findOwn(userId: number): Promise<ProfessionalProfile> {
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
      throw new NotFoundException('Nemate napravljen profesionalni profil.');
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
      throw new NotFoundException('Korisnički nalog ne postoji.');
    }

    const existingProfile = await this.profileRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (existingProfile) {
      throw new ConflictException('Već imate napravljen profesionalni profil.');
    }

    const profile = this.profileRepository.create({
      user,
      biography: dto.biography.trim(),
      yearsOfExperience: dto.yearsOfExperience,
      pricePerSession: dto.pricePerSession,
      specialties: dto.specialties.map((specialty) => specialty.trim()),
      isVerified: false,
    });

    const savedProfile = await this.profileRepository.save(profile);

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
      profile.yearsOfExperience = dto.yearsOfExperience;
    }

    if (dto.pricePerSession !== undefined) {
      profile.pricePerSession = dto.pricePerSession;
    }

    if (dto.specialties !== undefined) {
      profile.specialties = dto.specialties.map((specialty) =>
        specialty.trim(),
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
