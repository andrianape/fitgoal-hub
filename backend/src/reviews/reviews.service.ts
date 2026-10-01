import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { ProfessionalProfile } from '../professionals/entities/professional-profile.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(ProfessionalProfile)
    private readonly profileRepository: Repository<ProfessionalProfile>,
  ) {}

  async create(clientId: number, dto: CreateReviewDto) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: dto.appointmentId,
      },
      relations: {
        client: true,
        professional: {
          user: true,
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Rezervacija ne postoji.');
    }

    if (appointment.client.id !== clientId) {
      throw new ForbiddenException('Možete oceniti samo svoj termin.');
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new ConflictException(
        'Recenziju možete ostaviti samo nakon završenog termina.',
      );
    }

    const existingReview = await this.reviewRepository.findOne({
      where: {
        appointment: {
          id: appointment.id,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('Za ovaj termin već postoji recenzija.');
    }

    const review = this.reviewRepository.create({
      appointment,
      client: appointment.client,
      professional: appointment.professional,
      rating: dto.rating,
      comment: null,
    });

    try {
      const saved = await this.reviewRepository.save(review);
      return this.toResponse(saved);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Za ovaj termin već postoji recenzija.');
      }

      throw error;
    }
  }

  async findByProfessional(professionalId: number) {
    const profile = await this.profileRepository.findOneBy({
      id: professionalId,
      isVerified: true,
    });

    if (!profile) {
      throw new NotFoundException(
        'Verifikovani profesionalni profil ne postoji.',
      );
    }

    const reviews = await this.reviewRepository.find({
      where: {
        professional: {
          id: professionalId,
        },
      },
      relations: {
        client: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const total = reviews.length;

    const averageRating =
      total === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) / total;

    return {
      data: reviews.map((review) => this.toResponse(review)),
      total,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  async update(
    reviewId: number,
    clientId: number,
    dto: UpdateReviewDto,
  ) {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: {
        client: true,
        professional: true,
        appointment: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Recenzija ne postoji.');
    }

    if (review.client.id !== clientId) {
      throw new ForbiddenException('Možete menjati samo svoju recenziju.');
    }

    review.rating = dto.rating;
    review.comment = null;

    return this.toResponse(await this.reviewRepository.save(review));
  }

  private toResponse(review: Review) {
    return {
      id: review.id,
      rating: review.rating,
      client: {
        id: review.client.id,
        firstName: review.client.firstName,
        lastName: review.client.lastName,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async remove(
    reviewId: number,
    currentUserId: number,
    currentUserRole: UserRole,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: {
        client: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Recenzija ne postoji.');
    }

    const isOwner = review.client.id === currentUserId;
    const isAdmin = currentUserRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Nemate dozvolu da obrišete ovu recenziju.',
      );
    }

    await this.reviewRepository.remove(review);
  }
}