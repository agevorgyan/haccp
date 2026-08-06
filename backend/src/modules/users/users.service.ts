import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by phone number including organization context
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['organization'],
    });
  }

  /**
   * Find user by UUID primary key
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }
}
