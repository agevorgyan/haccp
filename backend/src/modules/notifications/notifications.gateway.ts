import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSocketsMap: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const authToken = client.handshake.auth?.token;

      let token = authToken;
      if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (!token) {
        this.logger.warn(`Client ${client.id} failed socket auth: No token provided.`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'super_secret_jwt_key_change_in_production',
      );
      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub;

      if (!userId) {
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      if (!this.userSocketsMap.has(userId)) {
        this.userSocketsMap.set(userId, new Set());
      }
      this.userSocketsMap.get(userId)?.add(client.id);

      this.logger.log(`Socket client connected: ${client.id} (User: ${userId})`);
    } catch (err: any) {
      this.logger.error(`Socket auth failed for ${client.id}: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId && this.userSocketsMap.has(userId)) {
      const userSockets = this.userSocketsMap.get(userId);
      userSockets?.delete(client.id);
      if (userSockets?.size === 0) {
        this.userSocketsMap.delete(userId);
      }
    }
    this.logger.log(`Socket client disconnected: ${client.id}`);
  }

  /**
   * Emit real-time socket notification to connected user clients
   */
  sendRealTimeNotification(userId: string, notification: any) {
    const userSockets = this.userSocketsMap.get(userId);
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
      this.logger.log(`Real-time notification emitted via Socket.io to user ${userId}`);
      return true;
    }
    return false;
  }
}
