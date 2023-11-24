import {
  WebSocketGateway,
  MessageBody,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { ServerToClientEvents } from './events';
import { Notification } from 'src/notification/entities/notification.entity';

@WebSocketGateway(3001, {
  namespace: 'events',
  // cors: {
  //   origin: ['http://localhost:3000'],
  //   credentials: true,
  // },
  // pingInterval: 10000,
  // pingTimeout: 15000,
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  // from CTS, from STC
  server: Server<any, ServerToClientEvents>;

  onModuleInit() {
    this.server.on('connection!', (socket) => {
      console.log(socket.id);
      console.log('connected!');
    });
  }

  @SubscribeMessage('notification')
  handleNotification(client: any, payload: any): string {
    return 'Hello world!';
  }
  sendNotification(notification: Notification) {
    this.server.emit('newNotification', notification);
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log('body', body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }
}
