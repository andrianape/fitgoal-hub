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
import {
  User,
} from '../../users/entities/user.entity';

@Entity({
  name: 'professional_profiles',
})
export class ProfessionalProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(
    () => User,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
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
    name: 'workplace_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  workplaceName!: string | null;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  address!: string | null;

  @Column({
    name: 'qualification_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  qualificationType!: string | null;

  @Column({
    name: 'qualification_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  qualificationName!: string | null;

  @Column({
    name: 'issuing_institution',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  issuingInstitution!: string | null;

  @Column({
    name: 'qualification_year',
    type: 'integer',
    nullable: true,
  })
  qualificationYear!: number | null;

  @Column({
    name: 'credential_number',
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  credentialNumber!: string | null;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
  })
  isVerified!: boolean;

  @Column({
    name: 'verification_note',
    type: 'text',
    nullable: true,
    select: false,
  })
  verificationNote!: string | null;

  @Column({
    name: 'verified_at',
    type: 'timestamp',
    nullable: true,
  })
  verifiedAt!: Date | null;

  @ManyToOne(
    () => User,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'verified_by_user_id',
  })
  verifiedBy!: User | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}