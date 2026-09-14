import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { ProfessionalProfile } from '../professionals/entities/professional-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { PlanType } from './enums/plan-type.enum';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository:
      Repository<Plan>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

    @InjectRepository(ProfessionalProfile)
    private readonly profileRepository:
      Repository<ProfessionalProfile>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository:
      Repository<Appointment>,
  ) {}

  async create(
    professionalUserId: number,
    professionalRole: UserRole,
    dto: CreatePlanDto,
  ): Promise<Plan> {
    this.validatePlanType(
      professionalRole,
      dto.type,
    );

    const professional =
      await this.profileRepository.findOne({
        where: {
          user: {
            id: professionalUserId,
          },
          isVerified: true,
        },
        relations: {
          user: true,
        },
      });

    if (!professional) {
      throw new NotFoundException(
        'Verifikovani profesionalni profil ne postoji.',
      );
    }

    const client = await this.userRepository.findOne({
      where: {
        id: dto.clientId,
        role: UserRole.CLIENT,
        isActive: true,
      },
    });

    if (!client) {
      throw new NotFoundException(
        'Aktivan klijentski nalog ne postoji.',
      );
    }

    const previousAppointment =
      await this.appointmentRepository.findOne({
        where: [
          {
            client: {
              id: client.id,
            },
            professional: {
              id: professional.id,
            },
            status: AppointmentStatus.CONFIRMED,
          },
          {
            client: {
              id: client.id,
            },
            professional: {
              id: professional.id,
            },
            status: AppointmentStatus.COMPLETED,
          },
        ],
      });

    if (!previousAppointment) {
      throw new ForbiddenException(
        'Plan možete napraviti samo klijentu koji ima potvrđen ili završen termin kod vas.',
      );
    }

    const dates = this.validateAndNormalizeDates(
      dto.startDate,
      dto.endDate,
    );

    const plan = this.planRepository.create({
      client,
      professional,
      type: dto.type,
      title: dto.title.trim(),
      description:
        dto.description?.trim() ?? null,
      content: dto.content,
      startDate: dates.startDate,
      endDate: dates.endDate,
      isActive: true,
    });

    const savedPlan =
      await this.planRepository.save(plan);

    return this.findOneDetailed(savedPlan.id);
  }

  async findMine(
    userId: number,
    role: UserRole,
  ): Promise<Plan[]> {
    if (role === UserRole.CLIENT) {
      return this.planRepository.find({
        where: {
          client: {
            id: userId,
          },
        },
        relations: {
          client: {
            city: true,
          },
          professional: {
            user: {
              city: true,
            },
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    if (
      role === UserRole.TRAINER ||
      role === UserRole.NUTRITIONIST
    ) {
      return this.planRepository.find({
        where: {
          professional: {
            user: {
              id: userId,
            },
          },
        },
        relations: {
          client: {
            city: true,
          },
          professional: {
            user: {
              city: true,
            },
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    if (role === UserRole.ADMIN) {
      return this.findAll();
    }

    return [];
  }

  findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      relations: {
        client: {
          city: true,
        },
        professional: {
          user: {
            city: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneForUser(
    id: number,
    currentUserId: number,
    currentUserRole: UserRole,
  ): Promise<Plan> {
    const plan = await this.findOneDetailed(id);

    const isClient =
      plan.client.id === currentUserId;

    const isAuthor =
      plan.professional.user.id === currentUserId;

    const isAdmin =
      currentUserRole === UserRole.ADMIN;

    if (!isClient && !isAuthor && !isAdmin) {
      throw new ForbiddenException(
        'Nemate dozvolu da vidite ovaj plan.',
      );
    }

    return plan;
  }

  async update(
    id: number,
    professionalUserId: number,
    dto: UpdatePlanDto,
  ): Promise<Plan> {
    const plan = await this.findOneDetailed(id);

    if (
      plan.professional.user.id !==
      professionalUserId
    ) {
      throw new ForbiddenException(
        'Možete menjati samo planove koje ste napravili.',
      );
    }

    if (dto.title !== undefined) {
      plan.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      plan.description = dto.description.trim();
    }

    if (dto.content !== undefined) {
      plan.content = dto.content;
    }

    if (
      dto.startDate !== undefined ||
      dto.endDate !== undefined
    ) {
      const startDate =
        dto.startDate ?? plan.startDate;

      const endDate =
        dto.endDate !== undefined
          ? dto.endDate
          : plan.endDate;

      const dates = this.validateAndNormalizeDates(
        startDate,
        endDate,
      );

      plan.startDate = dates.startDate;
      plan.endDate = dates.endDate;
    }

    if (dto.isActive !== undefined) {
      plan.isActive = dto.isActive;
    }

    await this.planRepository.save(plan);

    return this.findOneDetailed(id);
  }

  async remove(
    id: number,
    currentUserId: number,
    currentUserRole: UserRole,
  ): Promise<void> {
    const plan = await this.findOneDetailed(id);

    const isAuthor =
      plan.professional.user.id === currentUserId;

    const isAdmin =
      currentUserRole === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException(
        'Nemate dozvolu da obrišete ovaj plan.',
      );
    }

    await this.planRepository.remove(plan);
  }

  private validatePlanType(
    role: UserRole,
    type: PlanType,
  ): void {
    if (
      role === UserRole.TRAINER &&
      type !== PlanType.WORKOUT
    ) {
      throw new ForbiddenException(
        'Trener može praviti samo planove treninga.',
      );
    }

    if (
      role === UserRole.NUTRITIONIST &&
      type !== PlanType.NUTRITION
    ) {
      throw new ForbiddenException(
        'Nutricionista može praviti samo planove ishrane.',
      );
    }
  }

  private validateAndNormalizeDates(
    startDate: string,
    endDate?: string | null,
  ): {
    startDate: string;
    endDate: string | null;
  } {
    const normalizedStartDate =
      startDate.slice(0, 10);

    const normalizedEndDate =
      endDate?.slice(0, 10) ?? null;

    if (
      normalizedEndDate !== null &&
      normalizedEndDate < normalizedStartDate
    ) {
      throw new BadRequestException(
        'Datum završetka ne može biti pre datuma početka.',
      );
    }

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    };
  }

  private async findOneDetailed(
    id: number,
  ): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: {
        id,
      },
      relations: {
        client: {
          city: true,
        },
        professional: {
          user: {
            city: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(
        'Plan ne postoji.',
      );
    }

    return plan;
  }
}