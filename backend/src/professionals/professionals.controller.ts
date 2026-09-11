import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { ProfessionalsService } from './professionals.service';
import { FilterProfessionalsDto } from './dto/filter-professionals.dto';

@Controller('professionals')
export class ProfessionalsController {
  constructor(
    private readonly professionalsService:
      ProfessionalsService,
  ) {}

 @Get()
findAll(
  @Query() filters: FilterProfessionalsDto,
) {
  return this.professionalsService.findAll(filters);
}

  @Get('profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  findOwn(
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.professionalsService.findOwn(
      currentUser.id,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.professionalsService.findOne(id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateProfessionalProfileDto,
  ) {
    return this.professionalsService.create(
      currentUser.id,
      dto,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfessionalProfileDto,
  ) {
    return this.professionalsService.update(
      currentUser.id,
      dto,
    );
  }

  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateVerification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVerificationDto,
  ) {
    return this.professionalsService.updateVerification(
      id,
      dto.isVerified,
    );
  }
}