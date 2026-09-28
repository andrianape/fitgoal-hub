import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  JwtService,
} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  UsersService,
} from '../users/users.service';
import {
  UserRole,
} from '../users/enums/user-role.enum';
import {
  LoginDto,
} from './dto/login.dto';
import {
  RegisterDto,
} from './dto/register.dto';
import {
  JwtPayload,
} from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService:
      UsersService,

    private readonly jwtService:
      JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ) {
    if (
      !this.isPublicRegistrationRole(
        registerDto.role,
      )
    ) {
      throw new BadRequestException(
        'Izabrani tip korisničkog naloga nije dozvoljen.',
      );
    }

    const normalizedEmail =
      registerDto.email
        .trim()
        .toLowerCase();

    const existingUser =
      await this.usersService
        .findByEmail(
          normalizedEmail,
        );

    if (existingUser) {
      throw new ConflictException(
        'Korisnik sa ovom email adresom već postoji.',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        registerDto.password,
        12,
      );

    const user =
      await this.usersService.create({
        firstName:
          registerDto.firstName,

        lastName:
          registerDto.lastName,

        email:
          normalizedEmail,

        passwordHash,

        phoneNumber:
          registerDto.phoneNumber,

        cityId:
          registerDto.cityId,

        role:
          registerDto.role,
      });

    return {
      user,

      accessToken:
        await this.createAccessToken(
          user,
        ),
    };
  }

  async login(
    loginDto: LoginDto,
  ) {
    const user =
      await this.usersService
        .findByEmailWithPassword(
          loginDto.email,
        );

    if (!user) {
      throw new UnauthorizedException(
        'Email ili lozinka nisu ispravni.',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Email ili lozinka nisu ispravni.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Korisnički nalog nije aktivan.',
      );
    }

    const safeUser =
      await this.usersService.findOne(
        user.id,
      );

    return {
      user:
        safeUser,

      accessToken:
        await this.createAccessToken(
          safeUser,
        ),
    };
  }

  private isPublicRegistrationRole(
    role: UserRole,
  ): boolean {
    return (
      role === UserRole.CLIENT ||
      role === UserRole.TRAINER ||
      role === UserRole.NUTRITIONIST
    );
  }

  private createAccessToken(
    user: {
      id: number;
      email: string;
      role: JwtPayload['role'];
    },
  ): Promise<string> {
    const payload: JwtPayload = {
      sub:
        user.id,

      email:
        user.email,

      role:
        user.role,
    };

    return this.jwtService.signAsync(
      payload,
    );
  }
}