import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfessionalProfile } from '../../professionals/entities/professional-profile.entity';
import { User } from '../../users/entities/user.entity';
import { PlanType } from '../enums/plan-type.enum';

@Entity({ name: 'plans' })
export class Plan {
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

  @Column({
    type: 'enum',
    enum: PlanType,
  })
  type!: PlanType;

  @Column({
    type: 'varchar',
    length: 200,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'jsonb',
  })
  content!: Record<string, unknown>;

  @Column({
    name: 'start_date',
    type: 'date',
  })
  startDate!: string;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate!: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
