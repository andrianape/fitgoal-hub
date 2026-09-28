import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Server,
  Socket,
} from 'socket.io';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Notification } from './entities/notification.entity';

interface AuthenticatedSocketData {
  userId: number;
}

@WebSocketGateway({
  namespace: 'notifications',

  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class NotificationsGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  private readonly logger =
    new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  private readonly server!: Server;

  async handleConnection(
    client: Socket,
  ): Promise<void> {
    try {
      const token =
        client.handshake.auth?.['token'];

      if (
        typeof token !== 'string' ||
        token.length === 0
      ) {
        client.disconnect();

        return;
      }

      const payload =
        await this.jwtService
          .verifyAsync<JwtPayload>(token);

      const socketData:
        AuthenticatedSocketData = {
          userId: payload.sub,
        };

      client.data = socketData;

      await client.join(
        this.getUserRoom(payload.sub),
      );

      this.logger.log(
        `Korisnik ${payload.sub} povezan na obaveštenja.`,
      );
    } catch {
      this.logger.warn(
        'Odbijena neispravna Socket.IO konekcija.',
      );

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const socketData =
      client.data as
        | AuthenticatedSocketData
        | undefined;

    if (socketData?.userId) {
      this.logger.log(
        `Korisnik ${socketData.userId} prekinuo konekciju.`,
      );
    }
  }

  emitNotification(
    userId: number,
    notification: Notification,
  ): void {
    this.server
      .to(this.getUserRoom(userId))
      .emit(
        'notification:new',
        notification,
      );
  }

  private getUserRoom(
    userId: number,
  ): string {
    return `user:${userId}`;
  }
}