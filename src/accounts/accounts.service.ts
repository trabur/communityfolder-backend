import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthAccountDto } from './dto/auth-account.dto';
import { Account } from './entities/account.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

import * as jwt from "jsonwebtoken";

import * as sha512 from 'crypto-js/sha512'

@Injectable()
export class AccountsService {
  constructor(
    public eventEmitter: EventEmitter2,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>
  ) {}

  // register
  create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = new Account();
    account.email = createAccountDto.email;
    account.username = createAccountDto.username;
    account.password = sha512(createAccountDto.password).toString();
    account.subscribe = createAccountDto.subscribe;
    account.agreement = createAccountDto.agreement;

    return this.accountsRepository.save(account)
  }

  update(updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = new Account();
    account.id = updateAccountDto.id;
    account.email = updateAccountDto.email;
    account.username = updateAccountDto.username;
    account.password = updateAccountDto.password;
    if (updateAccountDto.password) {
      account.password = sha512(updateAccountDto.password).toString();
    }
    account.subscribe = updateAccountDto.subscribe;
    account.agreement = updateAccountDto.agreement;

    return this.accountsRepository.update({ id: account.id }, account).then(r => {
      return r.raw
    })
  }

  // login
  async auth(authAccountDto: AuthAccountDto): Promise<any> {
    // find account by given username
    const results = await this.accountsRepository.findOne({
      select: ["id", "email", "password", "username"],
      where: {
        username: authAccountDto.username
      }
    })

    // confirm auth request
    let password = sha512(authAccountDto.password).toString()
    if (results && results.password === password) {
      return jwt.sign({ 
        accountId: results.id,
        email: results.email,
        username: results.username,
      }, process.env.SECRET || 'development-secret')
    }

    // deny auth request
    return null
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.find();
  }

  findOne(id: string): Promise<Account> {
    return this.accountsRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.accountsRepository.delete(id);
  }

  // findOneWithHosts(id: string): Promise<Account> {
  //   return this.accountsRepository.findOne(id, {
  //     relations: ["collaborations", "ownerships"]
  //   });
  // }
}