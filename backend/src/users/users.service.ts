import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    findAll() : Promise<User[]> {
        return this.userRepository.find({
            relations: {
                city: true,
            },
            order: {
                lastName: 'ASC',
                firstName: 'ASC',
            },
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                city:true,
            },
        });

        if(!user) {
            throw new NotFoundException(
            `Korisnik sa ID vrednoscu ${id} ne postoji.`,
            );
        }  
        return user;      
    }

    async findByEmail(email: string) : Promise<User | null> {
        return this.userRepository.findOneBy({
            email: email.trim(). toLowerCase(),
        });
    }

    async findByEmailWithPassword(
        email: string, 
    ): Promise<User | null> {
        return this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('LOWER(user.email) = LOWER(:email)', {
            email: email.trim(),
        })
        .getOne();
    }

    async create(data: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
}): Promise<User> {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existingUser = await this.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new ConflictException(
      'Korisnik sa ovom email adresom već postoji.',
    );
  }

  const user = this.userRepository.create({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: normalizedEmail,
    passwordHash: data.passwordHash,
    phoneNumber: data.phoneNumber?.trim() ?? null,
    role: UserRole.CLIENT,
    isActive: true,
    city: null,
  });

  const savedUser = await this.userRepository.save(user);

  return this.findOne(savedUser.id);
}

    async update(
        id: number, 
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const user = await this.findOne(id);

        if(updateUserDto.email !== undefined) {
            const normalizedEmail = updateUserDto.email.trim().toLowerCase();

            const userWithSameEmail = await this.userRepository.findOneBy({
                email: normalizedEmail,
            });

            if(userWithSameEmail && userWithSameEmail.id !== id) {
                throw new ConflictException(
                    'Korisnik sa ovom email adresom vec postoji.',
                );
            }
            user.email = normalizedEmail;
        }

        if(updateUserDto.firstName !== undefined) {
            user.firstName = updateUserDto.firstName.trim();
        }

        if(updateUserDto.lastName !== undefined) {
            user.lastName = updateUserDto.lastName.trim();
        }

        if(updateUserDto.phoneNumber !== undefined) {
            user.phoneNumber = updateUserDto.phoneNumber.trim();
        }

        if(updateUserDto.role !== undefined) {
            user.role = updateUserDto.role;
        }

        await this.userRepository.save(user);

        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);

        await this.userRepository.remove(user);
    }
}