import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';

import { User } from './entities/user.entity';
import { Account } from '../accounts/entities/account.entity';
import { Website } from '../websites/entities/website.entity';

import * as jwt from "jsonwebtoken";
import * as sha512 from 'crypto-js/sha512'

async function findIdByName (email, domainName) {
  // find account by given email
  const account = await this.accountsRepository.findOne({
    select: ["id"],
    where: {
      email: email
    }
  })

  // find website & tenant by given domainName
  const website = await this.websitesRepository.findOne({
    select: ["id", "tenant"],
    where: {
      domainName: domainName
    }
  })

  return { 
    account,
    website, 
    tenant: website.tenant
  }
}

@Injectable()
export class UsersService {
  constructor(
    public eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Website)
    private readonly websitesRepository: Repository<Website>,
  ) {}

  // register
  async create(createUserDto: CreateUserDto): Promise<User> {
    let config = await findIdByName(
      createUserDto.email,
      createUserDto.domainName
    )

    const user = new User();
    user.username = createUserDto.username;
    user.password = sha512(createUserDto.password).toString();
    user.accountId = config.account.id;
    user.websiteId = config.website.id;
    user.tenantId = config.tenant.id;

    return this.usersRepository.save(user)
  }

  async update(updateUserDto: UpdateUserDto): Promise<User> {
    let config = await findIdByName(
      updateUserDto.email,
      updateUserDto.domainName
    )

    const user = new User();
    user.id = updateUserDto.id;
    user.username = updateUserDto.username;
    if (updateUserDto.password) {
      user.password = sha512(updateUserDto.password).toString();
    }
    user.accountId = config.account.id;
    user.websiteId = config.website.id;
    user.tenantId = config.tenant.id;

    return this.usersRepository.update({ id: user.id }, user).then(r => {
      return r.raw
    })
  }

  // login
  async auth(authUserDto: AuthUserDto): Promise<any> {
    let config = await findIdByName(
      authUserDto.email,
      authUserDto.domainName
    )

    // find account by given email
    const account = await this.accountsRepository.findOne({
      select: ["id", "email", "password", "user", "admin", "client", "master"],
      where: {
        email: authUserDto.email
      }
    })
    
    // find user by given username, websiteId, and tenantId
    const user = await this.usersRepository.findOne({
      select: ["id", "username", "password"],
      where: {
        username: authUserDto.username,
        accountId: account.id,
        websiteId: config.website.id,
        tenantId: config.tenant.id
      }
    })

    // hash password
    let password = sha512(authUserDto.password).toString()

    // confirm auth request
    if (account && account.password === password) {
      // if the passwords match then switch context
      if (user && user.password === account.password) {
        // update database with new account setting
        account.userId = user.id
        this.accountsRepository.update({ id: account.id }, account).then(r => {
          return r.raw
        })

        // return new account
        return jwt.sign({
          id: account.id,
          email: account.email,
          user: user,
          admin: account.admin,
          client: account.client,
          master: account.master,
        }, process.env.SECRET || 'development-secret')
      }
    }

    // deny auth request
    return { error: 'invalid username and password combination' }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // findOneWithHosts(id: string): Promise<User> {
  //   return this.usersRepository.findOne(id, {
  //     relations: ["collaborations", "ownerships"]
  //   });
  // }
}