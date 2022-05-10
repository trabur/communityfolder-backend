import { JoinColumn, ManyToOne, OneToOne, OneToMany, ManyToMany, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn, BaseEntity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

import { Length, IsNotEmpty } from "class-validator"

import { Account } from '../../accounts/entities/account.entity'
import { Tenant } from '../../tenants/entities/tenant.entity'
import { Website } from "../../websites/entities/website.entity";
import { SocialGroup } from "../../socialGroups/entities/socialGroup.entity";
import { Member } from "../../members/entities/member.entity";

@Entity()
@Unique(["username", "websiteId"])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Length(4, 20)
  username: string

  @Column()
  password: string

  // relation accounts
  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  // relation members
  @OneToMany(() => Member, member => member.user)
  members: Member[];

  // relation owned social groups
  @OneToMany(() => SocialGroup, socialGroup => socialGroup.owner)
  ownedSocialGroups: SocialGroup[];

  // relation account
  @Column({ type: "uuid", nullable: false })
  accountId: string;

  @ManyToOne(() => Account, account => account.users)
  @JoinColumn({ name: "accountId" })
  account: Account;

  // relation website
  @Column({ type: "uuid", nullable: false })
  websiteId: string;

  @ManyToOne(() => Website, website => website.users)
  @JoinColumn({ name: "websiteId" })
  website: Website;

  // relation tenant
  @Column({ type: "uuid", nullable: false })
  tenantId: string;

  @ManyToOne(() => Tenant, tenant => tenant.users)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  // record keeping
  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ default: 1 })
  @VersionColumn()
  version: number;
}