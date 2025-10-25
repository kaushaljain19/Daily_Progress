// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './user.entity';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) {}

//   findAll(): Promise<User[]> {
//     return this.usersRepository.find();
//   }

//   findOne(id: number): Promise<User | null> {
//     return this.usersRepository.findOneBy({ id });
//   }

//   async remove(id: number): Promise<void> {
//     await this.usersRepository.delete(id);
//   }
  
//   async create(user: User): Promise<User> {
//     return this.usersRepository.save(user);
//   }
// }


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(firstName: string, lastName: string): Promise<User> {
    const user = this.usersRepository.create({ firstName, lastName });
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['photos'] });
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
