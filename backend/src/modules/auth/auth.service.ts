import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
  ) { }

  async validateUser(phone: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { phone },
      relations: ['organization'],
      select: ['id', 'phone', 'passwordHash', 'role', 'firstName', 'lastName']
    });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      organizationId: user.organization?.id || '',
    };
    const token = this.jwtService.sign(payload);
    return {
      accessToken: token,
      access_token: token,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organization?.id,
      },
    };
  }

  // ՍԵՐՄՆԱՑԱՆԻ ՄԵԹՈԴԸ
  async seedTestData() {
    let org = await this.organizationRepository.findOne({ where: { name: 'Gayane Kitchen' } });

    if (!org) {
      org = await this.organizationRepository.save({
        name: 'Gayane Kitchen',
        subscriptionStatus: 'active',
      } as any);
    }

    let user = await this.userRepository.findOne({ where: { phone: '+37491111111' } });

    if (!user) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      user = this.userRepository.create({
        firstName: 'Avetis',
        lastName: 'Manager',
        phone: '+37491111111',
        passwordHash: hashedPassword,
        role: UserRole.OWNER,
        organization: org,
      });
      await this.userRepository.save(user);
    }

    return {
      message: 'Test data seeded successfully!',
      loginCredentials: {
        phone: '+37491111111',
        password: '1234',
      },
    };
  }
}