import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService:
      AvailabilityService,
  ) {}

  @Get('professional/:professionalId')
  findAvailableByProfessional(
    @Param('professionalId', ParseIntPipe)
    professionalId: number,
  ) {
    return this.availabilityService
      .findAvailableByProfessional(professionalId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  findOwn(
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.availabilityService.findOwn(
      currentUser.id,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAvailabilitySlotDto,
  ) {
    return this.availabilityService.create(
      currentUser.id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.availabilityService.remove(
      currentUser.id,
      id,
    );
  }
}