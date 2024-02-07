import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(user: Partial<User>): Promise<User | null> {
    return this.usersRepository.findOneBy(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete({id});
  }

  async insert(user: User) {
    return this.usersRepository.insert(user);
  }
}
