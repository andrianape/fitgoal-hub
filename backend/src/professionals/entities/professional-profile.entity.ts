import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'professional_profiles' })
export class ProfessionalProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @Column({
    type: 'text',
  })
  biography!: string;

  @Column({
    name: 'years_of_experience',
    type: 'integer',
  })
  yearsOfExperience!: number;

  @Column({
    name: 'price_per_session',
    type: 'integer',
  })
  pricePerSession!: number;

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  specialties!: string[];

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
  })
  isVerified!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
