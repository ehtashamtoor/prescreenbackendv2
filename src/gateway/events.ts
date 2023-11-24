import { Notification } from 'src/notification/entities/notification.entity';

export interface ServerToClientEvents {
  newNotification: (payload: Notification) => void;
  onMessage: (payload: {msg: string, content: string}) => void;
}
