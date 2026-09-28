import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
} from 'typeorm';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository:
      Repository<Appointment>,

    private readonly dataSource: DataSource,

    private readonly notificationsService:
      NotificationsService,
  ) {}

  async create(
    clientId: number,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const appointmentId =
      await this.dataSource.transaction(
        async (manager) => {
          const userRepository =
            manager.getRepository(User);

          const slotRepository =
            manager.getRepository(
              AvailabilitySlot,
            );

          const appointmentRepository =
            manager.getRepository(
              Appointment,
            );

          const client =
            await userRepository.findOneBy({
              id: clientId,
              isActive: true,
            });

          if (!client) {
            throw new NotFoundException(
              'Aktivan korisnički nalog ne postoji.',
            );
          }

          const slot = await slotRepository
            .createQueryBuilder('slot')
            .setLock('pessimistic_write')
            .innerJoinAndSelect(
              'slot.professional',
              'professional',
            )
            .innerJoinAndSelect(
              'professional.user',
              'professionalUser',
            )
            .where(
              'slot.id = :slotId',
              {
                slotId: dto.slotId,
              },
            )
            .getOne();

          if (!slot) {
            throw new NotFoundException(
              'Izabrani slobodan termin ne postoji.',
            );
          }

          if (
            !slot.professional.isVerified
          ) {
            throw new BadRequestException(
              'Profesionalni profil nije verifikovan.',
            );
          }

          if (slot.isBooked) {
            throw new ConflictException(
              'Izabrani termin je već rezervisan.',
            );
          }

          if (slot.startsAt <= new Date()) {
            throw new BadRequestException(
              'Termin koji je počeo ili prošao ne može biti rezervisan.',
            );
          }

          if (
            slot.professional.user.id ===
            clientId
          ) {
            throw new BadRequestException(
              'Ne možete rezervisati sopstveni termin.',
            );
          }

          slot.isBooked = true;

          await slotRepository.save(slot);

          const appointment =
            appointmentRepository.create({
              client,
              professional:
                slot.professional,
              slot,
              status:
                AppointmentStatus.PENDING,
              priceAtBooking:
                slot.professional
                  .pricePerSession,
              clientNote:
                dto.clientNote?.trim() ??
                null,
              professionalNote: null,
            });

          const savedAppointment =
            await appointmentRepository.save(
              appointment,
            );

          return savedAppointment.id;
        },
      );

    const appointment =
      await this.findOneDetailed(
        appointmentId,
      );

    await this.notificationsService
      .createAndSend({
        userId:
          appointment.professional.user.id,

        type:
          NotificationType
            .APPOINTMENT_REQUESTED,

        title:
          'Novi zahtev za rezervaciju',

        message:
          `${appointment.client.firstName} ` +
          `${appointment.client.lastName} ` +
          `je poslao/la zahtev za termin ` +
          `${this.formatAppointmentDate(
            appointment.slot.startsAt,
          )}.`,

        appointmentId: appointment.id,
      });

    return appointment;
  }

  async findMine(
    userId: number,
    role: UserRole,
  ): Promise<Appointment[]> {
    if (role === UserRole.CLIENT) {
      return this.appointmentRepository.find({
        where: {
          client: {
            id: userId,
          },
        },

        relations: {
          client: true,

          professional: {
            user: {
              city: true,
            },
          },

          slot: true,
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
      return this.appointmentRepository.find({
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
            user: true,
          },

          slot: true,
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

  findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: {
        client: {
          city: true,
        },

        professional: {
          user: {
            city: true,
          },
        },

        slot: true,
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  async cancel(
    appointmentId: number,
    clientId: number,
  ): Promise<Appointment> {
    await this.dataSource.transaction(
      async (manager) => {
        const appointmentRepository =
          manager.getRepository(
            Appointment,
          );

        const slotRepository =
          manager.getRepository(
            AvailabilitySlot,
          );

        const appointment =
          await appointmentRepository
            .createQueryBuilder(
              'appointment',
            )
            .setLock(
              'pessimistic_write',
            )
            .innerJoinAndSelect(
              'appointment.client',
              'client',
            )
            .innerJoinAndSelect(
              'appointment.slot',
              'slot',
            )
            .where(
              'appointment.id = :appointmentId',
              {
                appointmentId,
              },
            )
            .getOne();

        if (!appointment) {
          throw new NotFoundException(
            'Rezervacija ne postoji.',
          );
        }

        if (
          appointment.client.id !==
          clientId
        ) {
          throw new ForbiddenException(
            'Možete otkazati samo svoju rezervaciju.',
          );
        }

        if (
          appointment.status !==
            AppointmentStatus.PENDING &&
          appointment.status !==
            AppointmentStatus.CONFIRMED
        ) {
          throw new ConflictException(
            'Ovu rezervaciju nije moguće otkazati.',
          );
        }

        if (
          appointment.slot.startsAt <=
          new Date()
        ) {
          throw new BadRequestException(
            'Termin koji je počeo ili prošao ne može biti otkazan.',
          );
        }

        appointment.status =
          AppointmentStatus.CANCELLED;

        appointment.slot.isBooked = false;

        await slotRepository.save(
          appointment.slot,
        );

        await appointmentRepository.save(
          appointment,
        );
      },
    );

    const appointment =
      await this.findOneDetailed(
        appointmentId,
      );

    await this.notificationsService
      .createAndSend({
        userId:
          appointment.professional.user.id,

        type:
          NotificationType
            .APPOINTMENT_CANCELLED,

        title:
          'Rezervacija je otkazana',

        message:
          `${appointment.client.firstName} ` +
          `${appointment.client.lastName} ` +
          `je otkazao/la termin ` +
          `${this.formatAppointmentDate(
            appointment.slot.startsAt,
          )}.`,

        appointmentId: appointment.id,
      });

    return appointment;
  }

  async updateStatus(
    appointmentId: number,
    professionalUserId: number,
    dto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    await this.dataSource.transaction(
      async (manager) => {
        const appointmentRepository =
          manager.getRepository(
            Appointment,
          );

        const slotRepository =
          manager.getRepository(
            AvailabilitySlot,
          );

        const appointment =
          await appointmentRepository
            .createQueryBuilder(
              'appointment',
            )
            .setLock(
              'pessimistic_write',
            )
            .innerJoinAndSelect(
              'appointment.professional',
              'professional',
            )
            .innerJoinAndSelect(
              'professional.user',
              'professionalUser',
            )
            .innerJoinAndSelect(
              'appointment.slot',
              'slot',
            )
            .where(
              'appointment.id = :appointmentId',
              {
                appointmentId,
              },
            )
            .getOne();

        if (!appointment) {
          throw new NotFoundException(
            'Rezervacija ne postoji.',
          );
        }

        if (
          appointment.professional.user
            .id !== professionalUserId
        ) {
          throw new ForbiddenException(
            'Možete upravljati samo svojim terminima.',
          );
        }

        this.validateStatusChange(
          appointment.status,
          dto.status,
          appointment.slot.startsAt,
        );

        appointment.status = dto.status;

        if (
          dto.professionalNote !==
          undefined
        ) {
          appointment.professionalNote =
            dto.professionalNote.trim();
        }

        if (
          dto.status ===
          AppointmentStatus.REJECTED
        ) {
          appointment.slot.isBooked =
            false;

          await slotRepository.save(
            appointment.slot,
          );
        }

        await appointmentRepository.save(
          appointment,
        );
      },
    );

    const appointment =
      await this.findOneDetailed(
        appointmentId,
      );

    await this.notifyClientAboutStatus(
      appointment,
    );

    return appointment;
  }

  private validateStatusChange(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
    startsAt: Date,
  ): void {
    if (
      currentStatus ===
        AppointmentStatus.PENDING &&
      (
        newStatus ===
          AppointmentStatus.CONFIRMED ||
        newStatus ===
          AppointmentStatus.REJECTED
      )
    ) {
      return;
    }

    if (
      currentStatus ===
        AppointmentStatus.CONFIRMED &&
      newStatus ===
        AppointmentStatus.COMPLETED
    ) {
      if (startsAt > new Date()) {
        throw new BadRequestException(
          'Budući termin ne može biti označen kao završen.',
        );
      }

      return;
    }

    throw new ConflictException(
      `Promena statusa iz "${currentStatus}" ` +
        `u "${newStatus}" nije dozvoljena.`,
    );
  }

  private async notifyClientAboutStatus(
    appointment: Appointment,
  ): Promise<void> {
    if (
      appointment.status ===
      AppointmentStatus.CONFIRMED
    ) {
      await this.notificationsService
        .createAndSend({
          userId:
            appointment.client.id,

          type:
            NotificationType
              .APPOINTMENT_CONFIRMED,

          title: 'Termin je potvrđen',

          message:
            `${appointment.professional.user.firstName} ` +
            `${appointment.professional.user.lastName} ` +
            `je potvrdio/la tvoj termin ` +
            `${this.formatAppointmentDate(
              appointment.slot.startsAt,
            )}.`,

          appointmentId:
            appointment.id,
        });

      return;
    }

    if (
      appointment.status ===
      AppointmentStatus.REJECTED
    ) {
      await this.notificationsService
        .createAndSend({
          userId:
            appointment.client.id,

          type:
            NotificationType
              .APPOINTMENT_REJECTED,

          title: 'Zahtev je odbijen',

          message:
            `${appointment.professional.user.firstName} ` +
            `${appointment.professional.user.lastName} ` +
            `je odbio/la zahtev za termin ` +
            `${this.formatAppointmentDate(
              appointment.slot.startsAt,
            )}.`,

          appointmentId:
            appointment.id,
        });

      return;
    }

    if (
      appointment.status ===
      AppointmentStatus.COMPLETED
    ) {
      await this.notificationsService
        .createAndSend({
          userId:
            appointment.client.id,

          type:
            NotificationType
              .APPOINTMENT_COMPLETED,

          title: 'Termin je završen',

          message:
            `Termin kod profesionalca ` +
            `${appointment.professional.user.firstName} ` +
            `${appointment.professional.user.lastName} ` +
            `je označen kao završen.`,

          appointmentId:
            appointment.id,
        });
    }
  }

  private formatAppointmentDate(
    value: Date,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-RS',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Belgrade',
      },
    ).format(new Date(value));
  }

  private async findOneDetailed(
    id: number,
  ): Promise<Appointment> {
    const appointment =
      await this.appointmentRepository
        .findOne({
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

            slot: true,
          },
        });

    if (!appointment) {
      throw new NotFoundException(
        'Rezervacija ne postoji.',
      );
    }

    return appointment;
  }
}