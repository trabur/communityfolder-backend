import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantCreatedListener } from './listeners/tenant-created.listener';
import { TenantCreatedGateway } from './gateways/tenant-created.gateway';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [EventEmitterModule.forRoot(), TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantCreatedListener, TenantCreatedGateway]
})
export class TenantsModule {}