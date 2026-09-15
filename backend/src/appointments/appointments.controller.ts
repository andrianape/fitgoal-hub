import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../users/enums/user-role.enum';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(currentUser.id, dto);
  }

  @Get('me')
  findMine(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.appointmentsService.findMine(currentUser.id, currentUser.role);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CLIENT)
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.appointmentsService.cancel(id, currentUser.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, currentUser.id, dto);
  }
}
