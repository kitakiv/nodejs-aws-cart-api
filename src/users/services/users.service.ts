import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/index';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(name: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { name } });
  }

  createOne({ name, password, email = null }): Promise<User> {
    const newUser = { name, password, email };
    return this.usersRepository.save(newUser);
  }
}
