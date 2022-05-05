import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SocialGroup } from './entities/socialGroup.entity';
import { SocialGroupsService } from './socialGroups.service';
import { SocialGroupCreatedListener } from './listeners/socialGroup-created.listener';
import { SocialGroupCreatedGateway } from './gateways/socialGroup-created.gateway';
import { SocialGroupsController } from './socialGroups.controller';

@Module({
  imports: [EventEmitterModule.forRoot(), TypeOrmModule.forFeature([SocialGroup])],
  controllers: [SocialGroupsController],
  providers: [SocialGroupsService, SocialGroupCreatedListener, SocialGroupCreatedGateway]
})
export class SocialGroupsModule {}