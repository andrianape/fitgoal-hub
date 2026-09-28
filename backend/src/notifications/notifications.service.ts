import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository:
      Repository<Notification>,

    private readonly notificationsGateway:
      NotificationsGateway,
  ) {}

  findMine(
    userId: number,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        user: {
          id: userId,
        },
      },

      relations: {
        appointment: true,
      },

      order: {
        createdAt: 'DESC',
      },

      take: 50,
    });
  }

  async countUnread(
    userId: number,
  ): Promise<{ count: number }> {
    const count =
      await this.notificationRepository.count({
        where: {
          user: {
            id: userId,
          },
          isRead: false,
        },
      });

    return {
      count,
    };
  }

  async createAndSend(data: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    appointmentId?: number;
  }): Promise<Notification> {
    const notification =
      this.notificationRepository.create({
        user: {
          id: data.userId,
        } as User,

        appointment:
          data.appointmentId !== undefined
            ? ({
                id: data.appointmentId,
              } as Appointment)
            : null,

        type: data.type,
        title: data.title.trim(),
        message: data.message.trim(),
        isRead: false,
      });

    const savedNotification =
      await this.notificationRepository.save(
        notification,
      );

    this.notificationsGateway
      .emitNotification(
        data.userId,
        savedNotification,
      );

    return savedNotification;
  }

  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification =
      await this.notificationRepository.findOne({
        where: {
          id: notificationId,
          user: {
            id: userId,
          },
        },

        relations: {
          appointment: true,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Obaveštenje ne postoji.',
      );
    }

    if (!notification.isRead) {
      notification.isRead = true;

      await this.notificationRepository.save(
        notification,
      );
    }

    return notification;
  }

  async markAllAsRead(
    userId: number,
  ): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
      })
      .where(
        'user_id = :userId',
        {
          userId,
        },
      )
      .andWhere(
        'is_read = :isRead',
        {
          isRead: false,
        },
      )
      .execute();
  }
}