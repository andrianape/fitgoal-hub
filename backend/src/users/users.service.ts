import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  InjectRepository,
} from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  unlink,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import {
  Repository,
} from 'typeorm';
import {
  City,
} from '../cities/entities/city.entity';
import {
  ChangePasswordDto,
} from './dto/change-password.dto';
import {
  UpdateUserDto,
} from './dto/update-user.dto';
import {
  User,
} from './entities/user.entity';
import {
  UserRole,
} from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

    @InjectRepository(City)
    private readonly cityRepository:
      Repository<City>,
  ) {}

  findAll(): Promise<User[]> {
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

  async findOne(
    id: number,
  ): Promise<User> {
    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },

        relations: {
          city: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        `Korisnik sa ID vrednošću ${id} ne postoji.`,
      );
    }

    return user;
  }

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    return this.userRepository.findOneBy({
      email:
        email
          .trim()
          .toLowerCase(),
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where(
        'LOWER(user.email) = LOWER(:email)',
        {
          email: email.trim(),
        },
      )
      .getOne();
  }

  async create(
    data: {
      firstName: string;
      lastName: string;
      email: string;
      passwordHash: string;
      phoneNumber?: string;
      cityId: number;
      role: UserRole;
    },
  ): Promise<User> {
    const normalizedEmail =
      data.email
        .trim()
        .toLowerCase();

    const existingUser =
      await this.findByEmail(
        normalizedEmail,
      );

    if (existingUser) {
      throw new ConflictException(
        'Korisnik sa ovom email adresom već postoji.',
      );
    }

    if (data.role === UserRole.ADMIN) {
      throw new BadRequestException(
        'Administratorski nalog nije moguće napraviti javnom registracijom.',
      );
    }

    if (
      data.role !== UserRole.CLIENT &&
      data.role !== UserRole.TRAINER &&
      data.role !== UserRole.NUTRITIONIST
    ) {
      throw new BadRequestException(
        'Izabrani tip korisničkog naloga nije dozvoljen.',
      );
    }

    const city =
      await this.cityRepository.findOneBy({
        id: data.cityId,
      });

    if (!city) {
      throw new NotFoundException(
        `Grad sa ID vrednošću ${data.cityId} ne postoji.`,
      );
    }

    const phoneNumber =
      data.phoneNumber?.trim();

    const user =
      this.userRepository.create({
        firstName:
          data.firstName.trim(),

        lastName:
          data.lastName.trim(),

        email:
          normalizedEmail,

        passwordHash:
          data.passwordHash,

        phoneNumber:
          phoneNumber &&
          phoneNumber.length > 0
            ? phoneNumber
            : null,

        profileImageUrl:
          null,

        role:
          data.role,

        isActive:
          true,

        city,
      });

    const savedUser =
      await this.userRepository.save(
        user,
      );

    return this.findOne(
      savedUser.id,
    );
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user =
      await this.findOne(id);

    if (
      updateUserDto.email !== undefined
    ) {
      const normalizedEmail =
        updateUserDto.email
          .trim()
          .toLowerCase();

      const userWithSameEmail =
        await this.userRepository.findOneBy({
          email: normalizedEmail,
        });

      if (
        userWithSameEmail &&
        userWithSameEmail.id !== id
      ) {
        throw new ConflictException(
          'Korisnik sa ovom email adresom već postoji.',
        );
      }

      user.email = normalizedEmail;
    }

    if (
      updateUserDto.firstName !==
      undefined
    ) {
      user.firstName =
        updateUserDto.firstName.trim();
    }

    if (
      updateUserDto.lastName !==
      undefined
    ) {
      user.lastName =
        updateUserDto.lastName.trim();
    }

    if (
      updateUserDto.phoneNumber !==
      undefined
    ) {
      const phoneNumber =
        updateUserDto.phoneNumber.trim();

      user.phoneNumber =
        phoneNumber.length > 0
          ? phoneNumber
          : null;
    }

    if (
      updateUserDto.cityId !== undefined
    ) {
      if (
        updateUserDto.cityId === null
      ) {
        user.city = null;
      } else {
        const city =
          await this.cityRepository
            .findOneBy({
              id:
                updateUserDto.cityId,
            });

        if (!city) {
          throw new NotFoundException(
            `Grad sa ID vrednošću ${updateUserDto.cityId} ne postoji.`,
          );
        }

        user.city = city;
      }
    }

    await this.userRepository.save(
      user,
    );

    return this.findOne(id);
  }

  async updateProfileImage(
    userId: number,
    profileImageUrl: string,
  ): Promise<User> {
    const user =
      await this.findOne(userId);

    const previousProfileImageUrl =
      user.profileImageUrl;

    user.profileImageUrl =
      profileImageUrl;

    await this.userRepository.save(
      user,
    );

    await this.deleteProfileImageFile(
      previousProfileImageUrl,
    );

    return this.findOne(userId);
  }

  async removeProfileImage(
    userId: number,
  ): Promise<void> {
    const user =
      await this.findOne(userId);

    const previousProfileImageUrl =
      user.profileImageUrl;

    user.profileImageUrl = null;

    await this.userRepository.save(
      user,
    );

    await this.deleteProfileImageFile(
      previousProfileImageUrl,
    );
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user =
      await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where(
          'user.id = :userId',
          {
            userId,
          },
        )
        .getOne();

    if (!user) {
      throw new NotFoundException(
        'Korisnički nalog ne postoji.',
      );
    }

    const currentPasswordMatches =
      await bcrypt.compare(
        dto.currentPassword,
        user.passwordHash,
      );

    if (!currentPasswordMatches) {
      throw new UnauthorizedException(
        'Trenutna lozinka nije ispravna.',
      );
    }

    const newPasswordMatchesOld =
      await bcrypt.compare(
        dto.newPassword,
        user.passwordHash,
      );

    if (newPasswordMatchesOld) {
      throw new BadRequestException(
        'Nova lozinka mora biti drugačija od trenutne.',
      );
    }

    user.passwordHash =
      await bcrypt.hash(
        dto.newPassword,
        12,
      );

    await this.userRepository.save(
      user,
    );
  }

  async updateRole(
    id: number,
    role: UserRole,
  ): Promise<User> {
    const user =
      await this.findOne(id);

    user.role = role;

    await this.userRepository.save(
      user,
    );

    return this.findOne(id);
  }

  async updateStatus(
    id: number,
    isActive: boolean,
  ): Promise<User> {
    const user =
      await this.findOne(id);

    user.isActive = isActive;

    await this.userRepository.save(
      user,
    );

    return this.findOne(id);
  }

  async remove(
    id: number,
  ): Promise<void> {
    const user =
      await this.findOne(id);

    await this.userRepository.remove(
      user,
    );
  }

  private async deleteProfileImageFile(
    profileImageUrl: string | null,
  ): Promise<void> {
    if (
      !profileImageUrl?.startsWith(
        '/uploads/profile-images/',
      )
    ) {
      return;
    }

    const relativePath =
      profileImageUrl.replace(
        /^\//,
        '',
      );

    const absolutePath = join(
      process.cwd(),
      relativePath,
    );

    try {
      await unlink(absolutePath);
    } catch (error: unknown) {
      const fileError =
        error as NodeJS.ErrnoException;

      if (
        fileError.code !== 'ENOENT'
      ) {
        throw error;
      }
    }
  }
}