// import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { User } from './user.entity';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get()
//   findAll(): Promise<User[]> {
//     return this.usersService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string): Promise<User | null> {
//     return this.usersService.findOne(+id);
//   }

//   @Post()
//   create(@Body() user: User): Promise<User> {
//     return this.usersService.create(user);  // Service ka method call karo
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string): Promise<void> {
//     return this.usersService.remove(+id);
//   }
// }

import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { firstName: string; lastName: string }): Promise<User> {
    return this.usersService.create(body.firstName, body.lastName);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}

