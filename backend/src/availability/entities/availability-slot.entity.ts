import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfessionalProfile } from '../../professionals/entities/professional-profile.entity';

@Entity({ name: 'availability_slots' })
export class AvailabilitySlot {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProfessionalProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  professional!: ProfessionalProfile;

  @Column({
    name: 'starts_at',
    type: 'timestamptz',
  })
  startsAt!: Date;

  @Column({
    name: 'ends_at',
    type: 'timestamptz',
  })
  endsAt!: Date;

  @Column({
    name: 'is_booked',
    type: 'boolean',
    default: false,
  })
  isBooked!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}