import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansService } from './plans.service';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreatePlanDto,
  ) {
    return this.plansService.create(currentUser.id, currentUser.role, dto);
  }

  @Get('me')
  findMine(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.plansService.findMine(currentUser.id, currentUser.role);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.plansService.findOneForUser(
      id,
      currentUser.id,
      currentUser.role,
    );
  }

  @Patch(':id')
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, currentUser.id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.plansService.remove(id, currentUser.id, currentUser.role);
  }
}
