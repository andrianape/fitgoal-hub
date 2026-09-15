import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName!: string;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 255,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role!: UserRole;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  phoneNumber!: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(() => City, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  city!: City | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
