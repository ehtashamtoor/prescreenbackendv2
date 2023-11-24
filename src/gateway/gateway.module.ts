import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayGateway } from './gateway.gateway';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [GatewayGateway, GatewayService, EventsGateway],
})
export class GatewayModule {}
