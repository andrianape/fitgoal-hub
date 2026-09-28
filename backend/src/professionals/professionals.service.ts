import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InjectRepository,
} from '@nestjs/typeorm';
import {
  Repository,
} from 'typeorm';
import {
  User,
} from '../users/entities/user.entity';
import {
  UserRole,
} from '../users/enums/user-role.enum';
import {
  CreateProfessionalProfileDto,
} from './dto/create-professional-profile.dto';
import {
  FilterProfessionalsDto,
} from './dto/filter-professionals.dto';
import {
  UpdateProfessionalProfileDto,
} from './dto/update-professional-profile.dto';
import {
  ProfessionalProfile,
} from './entities/professional-profile.entity';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(
      ProfessionalProfile,
    )
    private readonly profileRepository:
      Repository<ProfessionalProfile>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
  ) {}

  async findAll(
    filters: FilterProfessionalsDto,
  ) {
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const query =
      this.profileRepository
        .createQueryBuilder('profile')
        .leftJoinAndSelect(
          'profile.user',
          'user',
        )
        .leftJoinAndSelect(
          'user.city',
          'city',
        )
        .where(
          'profile.isVerified = :isVerified',
          {
            isVerified: true,
          },
        );

    if (filters.role !== undefined) {
      query.andWhere(
        'user.role = :role',
        {
          role: filters.role,
        },
      );
    }

    if (
      filters.cityId !== undefined
    ) {
      query.andWhere(
        'city.id = :cityId',
        {
          cityId: filters.cityId,
        },
      );
    }

    if (
      filters.specialty !== undefined
    ) {
      query.andWhere(
        `
          EXISTS (
            SELECT 1
            FROM unnest(
              profile.specialties
            ) AS specialty
            WHERE LOWER(specialty)
              LIKE LOWER(:specialty)
          )
        `,
        {
          specialty:
            `%${filters.specialty.trim()}%`,
        },
      );
    }

    if (
      filters.maxPrice !== undefined
    ) {
      query.andWhere(
        `
          profile.pricePerSession
            <= :maxPrice
        `,
        {
          maxPrice:
            filters.maxPrice,
        },
      );
    }

    if (
      filters.search !== undefined
    ) {
      const search =
        `%${filters.search.trim()}%`;

      query.andWhere(
        `
          (
            LOWER(user.firstName)
              LIKE LOWER(:search)
            OR LOWER(user.lastName)
              LIKE LOWER(:search)
            OR LOWER(
              CONCAT(
                user.firstName,
                ' ',
                user.lastName
              )
            ) LIKE LOWER(:search)
            OR LOWER(
              COALESCE(
                profile.workplaceName,
                ''
              )
            ) LIKE LOWER(:search)
          )
        `,
        {
          search,
        },
      );
    }

    query
      .orderBy(
        'profile.createdAt',
        'DESC',
      )
      .skip(skip)
      .take(limit);

    const [
      data,
      total,
    ] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,

      totalPages:
        Math.ceil(total / limit),
    };
  }

  async findAllForAdmin():
    Promise<ProfessionalProfile[]> {
    return this.profileRepository
      .createQueryBuilder('profile')
      .addSelect(
        'profile.credentialNumber',
      )
      .addSelect(
        'profile.verificationNote',
      )
      .leftJoinAndSelect(
        'profile.user',
        'user',
      )
      .leftJoinAndSelect(
        'user.city',
        'city',
      )
      .leftJoinAndSelect(
        'profile.verifiedBy',
        'verifiedBy',
      )
      .orderBy(
        'profile.isVerified',
        'ASC',
      )
      .addOrderBy(
        'profile.createdAt',
        'DESC',
      )
      .getMany();
  }

  async findOne(
    id: number,
  ): Promise<ProfessionalProfile> {
    const profile =
      await this.profileRepository
        .findOne({
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
    const profile =
      await this.profileRepository
        .createQueryBuilder('profile')
        .addSelect(
          'profile.credentialNumber',
        )
        .addSelect(
          'profile.verificationNote',
        )
        .leftJoinAndSelect(
          'profile.user',
          'user',
        )
        .leftJoinAndSelect(
          'user.city',
          'city',
        )
        .leftJoinAndSelect(
          'profile.verifiedBy',
          'verifiedBy',
        )
        .where(
          'user.id = :userId',
          {
            userId,
          },
        )
        .getOne();

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
    const user =
      await this.userRepository
        .findOne({
          where: {
            id: userId,
            isActive: true,
          },

          relations: {
            city: true,
          },
        });

    if (!user) {
      throw new NotFoundException(
        'Aktivan korisnički nalog ne postoji.',
      );
    }

    this.validateProfessionalRole(
      user.role,
    );

    this.validateProfessionalData(
      user.role,
      {
        workplaceName:
          dto.workplaceName,

        address:
          dto.address,

        qualificationType:
          dto.qualificationType,

        qualificationName:
          dto.qualificationName,

        issuingInstitution:
          dto.issuingInstitution,

        qualificationYear:
          dto.qualificationYear,

        credentialNumber:
          dto.credentialNumber,
      },
    );

    const existingProfile =
      await this.profileRepository
        .findOne({
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

    const specialties =
      this.normalizeSpecialties(
        dto.specialties,
      );

    const profile =
      this.profileRepository.create({
        user,

        biography:
          dto.biography.trim(),

        yearsOfExperience:
          dto.yearsOfExperience,

        pricePerSession:
          dto.pricePerSession,

        specialties,

        workplaceName:
          dto.workplaceName?.trim() ??
          null,

        address:
          dto.address.trim(),

        qualificationType:
          dto.qualificationType.trim(),

        qualificationName:
          dto.qualificationName.trim(),

        issuingInstitution:
          dto.issuingInstitution.trim(),

        qualificationYear:
          dto.qualificationYear,

        credentialNumber:
          dto.credentialNumber.trim(),

        isVerified:
          false,

        verificationNote:
          null,

        verifiedAt:
          null,

        verifiedBy:
          null,
      });

    const savedProfile =
      await this.profileRepository.save(
        profile,
      );

    return this.findOwn(
      savedProfile.user.id,
    );
  }

  async update(
    userId: number,
    dto: UpdateProfessionalProfileDto,
  ): Promise<ProfessionalProfile> {
    const profile =
      await this.findOwn(userId);

    if (
      dto.biography !== undefined
    ) {
      profile.biography =
        dto.biography.trim();
    }

    if (
      dto.yearsOfExperience !==
      undefined
    ) {
      profile.yearsOfExperience =
        dto.yearsOfExperience;
    }

    if (
      dto.pricePerSession !== undefined
    ) {
      profile.pricePerSession =
        dto.pricePerSession;
    }

    if (
      dto.specialties !== undefined
    ) {
      profile.specialties =
        this.normalizeSpecialties(
          dto.specialties,
        );
    }

    if (
      dto.workplaceName !== undefined
    ) {
      profile.workplaceName =
        dto.workplaceName.trim();
    }

    if (
      dto.address !== undefined
    ) {
      profile.address =
        dto.address.trim();
    }

    if (
      dto.qualificationType !==
      undefined
    ) {
      profile.qualificationType =
        dto.qualificationType.trim();
    }

    if (
      dto.qualificationName !==
      undefined
    ) {
      profile.qualificationName =
        dto.qualificationName.trim();
    }

    if (
      dto.issuingInstitution !==
      undefined
    ) {
      profile.issuingInstitution =
        dto.issuingInstitution.trim();
    }

    if (
      dto.qualificationYear !==
      undefined
    ) {
      profile.qualificationYear =
        dto.qualificationYear;
    }

    if (
      dto.credentialNumber !==
      undefined
    ) {
      profile.credentialNumber =
        dto.credentialNumber.trim();
    }

    this.validateProfessionalData(
      profile.user.role,
      {
        workplaceName:
          profile.workplaceName,

        address:
          profile.address,

        qualificationType:
          profile.qualificationType,

        qualificationName:
          profile.qualificationName,

        issuingInstitution:
          profile.issuingInstitution,

        qualificationYear:
          profile.qualificationYear,

        credentialNumber:
          profile.credentialNumber,
      },
    );

    profile.isVerified = false;
    profile.verificationNote = null;
    profile.verifiedAt = null;
    profile.verifiedBy = null;

    await this.profileRepository.save(
      profile,
    );

    return this.findOwn(userId);
  }

  async updateVerification(
    id: number,
    isVerified: boolean,
    verificationNote?: string,
    adminUserId?: number,
  ): Promise<ProfessionalProfile> {
    const profile =
      await this.profileRepository
        .createQueryBuilder('profile')
        .addSelect(
          'profile.credentialNumber',
        )
        .addSelect(
          'profile.verificationNote',
        )
        .leftJoinAndSelect(
          'profile.user',
          'user',
        )
        .leftJoinAndSelect(
          'user.city',
          'city',
        )
        .where(
          'profile.id = :id',
          {
            id,
          },
        )
        .getOne();

    if (!profile) {
      throw new NotFoundException(
        `Profesionalni profil sa ID vrednošću ${id} ne postoji.`,
      );
    }

    const normalizedNote =
      verificationNote?.trim();

    if (
      !isVerified &&
      !normalizedNote
    ) {
      throw new BadRequestException(
        'Razlog odbijanja profesionalnog profila je obavezan.',
      );
    }

    let administrator: User | null =
      null;

    if (adminUserId !== undefined) {
      administrator =
        await this.userRepository
          .findOneBy({
            id: adminUserId,
            role: UserRole.ADMIN,
            isActive: true,
          });

      if (!administrator) {
        throw new NotFoundException(
          'Aktivan administratorski nalog ne postoji.',
        );
      }
    }

    profile.isVerified =
      isVerified;

    profile.verificationNote =
      normalizedNote ?? null;

    profile.verifiedAt =
      isVerified
        ? new Date()
        : null;

    profile.verifiedBy =
      administrator;

    await this.profileRepository.save(
      profile,
    );

    return this.findProfileForAdmin(
      profile.id,
    );
  }

  private async findProfileForAdmin(
    id: number,
  ): Promise<ProfessionalProfile> {
    const profile =
      await this.profileRepository
        .createQueryBuilder('profile')
        .addSelect(
          'profile.credentialNumber',
        )
        .addSelect(
          'profile.verificationNote',
        )
        .leftJoinAndSelect(
          'profile.user',
          'user',
        )
        .leftJoinAndSelect(
          'user.city',
          'city',
        )
        .leftJoinAndSelect(
          'profile.verifiedBy',
          'verifiedBy',
        )
        .where(
          'profile.id = :id',
          {
            id,
          },
        )
        .getOne();

    if (!profile) {
      throw new NotFoundException(
        'Profesionalni profil ne postoji.',
      );
    }

    return profile;
  }

  private validateProfessionalRole(
    role: UserRole,
  ): void {
    if (
      role !== UserRole.TRAINER &&
      role !== UserRole.NUTRITIONIST
    ) {
      throw new BadRequestException(
        'Samo trener ili nutricionista može napraviti profesionalni profil.',
      );
    }
  }

  private validateProfessionalData(
    role: UserRole,
    data: {
      workplaceName?:
        string | null;

      address?:
        string | null;

      qualificationType?:
        string | null;

      qualificationName?:
        string | null;

      issuingInstitution?:
        string | null;

      qualificationYear?:
        number | null;

      credentialNumber?:
        string | null;
    },
  ): void {
    this.validateProfessionalRole(role);

    if (
      role === UserRole.TRAINER &&
      !data.workplaceName?.trim()
    ) {
      throw new BadRequestException(
        'Naziv teretane je obavezan za trenera.',
      );
    }

    if (!data.address?.trim()) {
      throw new BadRequestException(
        role === UserRole.TRAINER
          ? 'Adresa teretane je obavezna.'
          : 'Adresa konsultacija je obavezna.',
      );
    }

    if (
      !data.qualificationType?.trim()
    ) {
      throw new BadRequestException(
        'Vrsta kvalifikacije je obavezna.',
      );
    }

    if (
      !data.qualificationName?.trim()
    ) {
      throw new BadRequestException(
        'Naziv kvalifikacije je obavezan.',
      );
    }

    if (
      !data.issuingInstitution?.trim()
    ) {
      throw new BadRequestException(
        'Naziv ustanove koja je izdala kvalifikaciju je obavezan.',
      );
    }

    if (
      data.qualificationYear ===
        undefined ||
      data.qualificationYear === null
    ) {
      throw new BadRequestException(
        'Godina sticanja kvalifikacije je obavezna.',
      );
    }

    if (
      !data.credentialNumber?.trim()
    ) {
      throw new BadRequestException(
        'Broj sertifikata ili diplome je obavezan.',
      );
    }
  }

  private normalizeSpecialties(
    specialties: string[],
  ): string[] {
    const normalizedSpecialties =
      specialties
        .map((specialty) =>
          specialty.trim(),
        )
        .filter(
          (specialty) =>
            specialty.length > 0,
        );

    if (
      normalizedSpecialties.length === 0
    ) {
      throw new BadRequestException(
        'Potrebno je uneti najmanje jednu specijalnost.',
      );
    }

    return Array.from(
      new Set(
        normalizedSpecialties,
      ),
    );
  }
}