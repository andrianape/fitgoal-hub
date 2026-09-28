import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService:
      NotificationsService,
  ) {}

  @Get('me')
  findMine(
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.notificationsService
      .findMine(currentUser.id);
  }

  @Get('unread-count')
  countUnread(
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.notificationsService
      .countUnread(currentUser.id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllAsRead(
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.notificationsService
      .markAllAsRead(currentUser.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.notificationsService
      .markAsRead(
        id,
        currentUser.id,
      );
  }
}