import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
  NotificationsService,
} from '../notifications/notifications.service';
import {
  NotificationType,
} from '../notifications/enums/notification-type.enum';
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

    private readonly notificationsService:
      NotificationsService,
  ) {}

  async findAll(
    filters: FilterProfessionalsDto,
  ) {
    const page = filters.page;
    const limit = filters.limit;
    const skip =
      (page - 1) * limit;

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

    if (
      filters.role !== undefined
    ) {
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
    ] =
      await query.getManyAndCount();

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
        });

    if (!user) {
      throw new NotFoundException(
        'Aktivan korisnički nalog ne postoji.',
      );
    }

    this.validateProfessionalRole(
      user.role,
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

    const workplaceName =
      dto.workplaceName?.trim() ??
      null;

    const specialties =
      this.normalizeSpecialties(
        dto.specialties,
      );

    this.validateProfessionalData({
      role: user.role,
      workplaceName,
      address:
        dto.address.trim(),
      qualificationType:
        dto.qualificationType.trim(),
      qualificationName:
        dto.qualificationName.trim(),
      issuingInstitution:
        dto.issuingInstitution.trim(),
      credentialNumber:
        dto.credentialNumber.trim(),
    });

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

        workplaceName,

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

        isVerified: false,

        verificationNote: null,
        verifiedAt: null,
        verifiedBy: null,
      });

    const savedProfile =
      await this.profileRepository
        .save(profile);

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

    this.validateProfessionalRole(
      profile.user.role,
    );

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
      dto.pricePerSession !==
      undefined
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
      dto.workplaceName !==
      undefined
    ) {
      const workplaceName =
        dto.workplaceName.trim();

      profile.workplaceName =
        workplaceName.length > 0
          ? workplaceName
          : null;
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

    this.validateProfessionalData({
      role: profile.user.role,

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

      credentialNumber:
        profile.credentialNumber,
    });

    profile.isVerified = false;
    profile.verificationNote = null;
    profile.verifiedAt = null;
    profile.verifiedBy = null;

    await this.profileRepository
      .save(profile);

    return this.findOwn(userId);
  }

  async updateVerification(
    id: number,
    isVerified: boolean,
    verificationNote?: string,
    adminUserId?: number,
  ): Promise<ProfessionalProfile> {
    const profile =
      await this.findProfileForAdmin(
        id,
      );

    const normalizedNote =
      verificationNote?.trim() ??
      '';

    if (
      !isVerified &&
      normalizedNote.length < 2
    ) {
      throw new BadRequestException(
        'Razlog odbijanja profesionalnog profila je obavezan.',
      );
    }

    let administrator:
      User | null = null;

    if (
      adminUserId !== undefined
    ) {
      administrator =
        await this.userRepository
          .findOne({
            where: {
              id: adminUserId,
              role: UserRole.ADMIN,
              isActive: true,
            },
          });

      if (!administrator) {
        throw new ForbiddenException(
          'Aktivan administratorski nalog ne postoji.',
        );
      }
    }

    profile.isVerified =
      isVerified;

    profile.verificationNote =
      normalizedNote.length > 0
        ? normalizedNote
        : null;

    profile.verifiedAt =
      new Date();

    profile.verifiedBy =
      administrator;

    await this.profileRepository
      .save(profile);

    if (isVerified) {
      await this.notificationsService
        .createAndSend({
          userId:
            profile.user.id,

          type:
            NotificationType
              .PROFESSIONAL_PROFILE_VERIFIED,

          title:
            'Profesionalni profil je odobren',

          message:
            'Tvoj profesionalni profil je verifikovan i sada je vidljiv klijentima.',
        });
    } else {
      await this.notificationsService
        .createAndSend({
          userId:
            profile.user.id,

          type:
            NotificationType
              .PROFESSIONAL_PROFILE_REJECTED,

          title:
            'Profesionalni profil nije odobren',

          message:
            `Profil je potrebno dopuniti ili ispraviti. Razlog: ${normalizedNote}`,
        });
    }

    return this.findProfileForAdmin(
      id,
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
        `Profesionalni profil sa ID vrednošću ${id} ne postoji.`,
      );
    }

    return profile;
  }

  private validateProfessionalRole(
    role: UserRole,
  ): void {
    if (
      role !== UserRole.TRAINER &&
      role !==
        UserRole.NUTRITIONIST
    ) {
      throw new ForbiddenException(
        'Profesionalni profil može imati samo trener ili nutricionista.',
      );
    }
  }

  private validateProfessionalData(
    data: {
      role: UserRole;
      workplaceName:
        string | null;
      address:
        string | null;
      qualificationType:
        string | null;
      qualificationName:
        string | null;
      issuingInstitution:
        string | null;
      credentialNumber:
        string | null;
    },
  ): void {
    if (
      data.role ===
        UserRole.TRAINER &&
      (
        !data.workplaceName ||
        data.workplaceName
          .trim()
          .length < 2
      )
    ) {
      throw new BadRequestException(
        'Lični trener mora uneti naziv teretane ili mesta rada.',
      );
    }

    if (
      !data.address ||
      data.address.trim().length < 5
    ) {
      throw new BadRequestException(
        'Tačna adresa mesta rada je obavezna.',
      );
    }

    if (
      !data.qualificationType ||
      data.qualificationType
        .trim()
        .length < 2
    ) {
      throw new BadRequestException(
        'Vrsta kvalifikacije je obavezna.',
      );
    }

    if (
      !data.qualificationName ||
      data.qualificationName
        .trim()
        .length < 2
    ) {
      throw new BadRequestException(
        'Naziv kvalifikacije je obavezan.',
      );
    }

    if (
      !data.issuingInstitution ||
      data.issuingInstitution
        .trim()
        .length < 2
    ) {
      throw new BadRequestException(
        'Ustanova koja je izdala kvalifikaciju je obavezna.',
      );
    }

    if (
      !data.credentialNumber ||
      data.credentialNumber
        .trim()
        .length < 2
    ) {
      throw new BadRequestException(
        'Broj kvalifikacije ili sertifikata je obavezan.',
      );
    }
  }

  private normalizeSpecialties(
    specialties: string[],
  ): string[] {
    const normalized =
      [
        ...new Set(
          specialties
            .map(
              (specialty) =>
                specialty.trim(),
            )
            .filter(
              (specialty) =>
                specialty.length > 0,
            ),
        ),
      ];

    if (
      normalized.length === 0
    ) {
      throw new BadRequestException(
        'Potrebno je uneti najmanje jednu specijalnost.',
      );
    }

    return normalized;
  }
}