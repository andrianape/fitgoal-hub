import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { ProfessionalProfile } from '../../professionals/entities/professional-profile.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Appointment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'appointment_id',
  })
  appointment!: Appointment;

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

  @Column({
    type: 'integer',
  })
  rating!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment!: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}