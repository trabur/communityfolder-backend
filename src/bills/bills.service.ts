import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

import { Bill } from './entities/bill.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

async function findIdByName (that, tenantReferenceId) {
  // find tenant by given tenantReferenceId
  const tenant = await that.tenantsRepository.findOne({
    select: ["id"],
    where: {
      referenceId: tenantReferenceId
    }
  })

  return { 
    tenant
  }
}

@Injectable()
export class BillsService {
  constructor(
    public eventEmitter: EventEmitter2,
    @InjectRepository(Bill)
    private readonly billsRepository: Repository<Bill>,
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
  ) {}

  // register
  async create(createBillDto: CreateBillDto): Promise<Bill> {
    let config = await findIdByName(
      this,
      createBillDto.tenantReferenceId,
    )

    const bill = new Bill();
    bill.domainName = createBillDto.domainName;
    bill.displayName = createBillDto.displayName;
    bill.ownerId = createBillDto.ownerId;
    bill.tenantId = config.tenant.id;

    return this.billsRepository.save(bill)
  }

  async update(updateBillDto: UpdateBillDto): Promise<Bill> {
    // let config = await findIdByName(
    //   this,
    //   updateBillDto.tenantReferenceId,
    // )

    const bill = new Bill();
    bill.id = updateBillDto.id;
    bill.domainName = updateBillDto.domainName;
    bill.displayName = updateBillDto.displayName;
    bill.ownerId = updateBillDto.ownerId;

    await this.billsRepository.update(bill.id, bill)
    return this.billsRepository.findOneBy({ id: bill.id });
  }

  async findAll(): Promise<Bill[]> {
    return this.billsRepository.find();
  }

  findOne(id: string): Promise<Bill> {
    return this.billsRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.billsRepository.delete(id);
  }

  // findOneWithHosts(id: string): Promise<Bill> {
  //   return this.billsRepository.findOne(id, {
  //     relations: ["collaborations", "ownerships"]
  //   });
  // }
}