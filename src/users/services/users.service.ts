import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, CreateUserDto } from '../models/index';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(name: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { name } });
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
    });
    return this.usersRepository.save(user);
  }
}
