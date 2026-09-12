import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AvailabilitySlot } from '../../availability/entities/availability-slot.entity';
import { ProfessionalProfile } from '../../professionals/entities/professional-profile.entity';
import { User } from '../../users/entities/user.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'client_id',
  })
  client!: User;

  @ManyToOne(() => ProfessionalProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'professional_id',
  })
  professional!: ProfessionalProfile;

  @ManyToOne(() => AvailabilitySlot, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'availability_slot_id',
  })
  slot!: AvailabilitySlot;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status!: AppointmentStatus;

  @Column({
    name: 'price_at_booking',
    type: 'integer',
  })
  priceAtBooking!: number;

  @Column({
    name: 'client_note',
    type: 'text',
    nullable: true,
  })
  clientNote!: string | null;

  @Column({
    name: 'professional_note',
    type: 'text',
    nullable: true,
  })
  professionalNote!: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}