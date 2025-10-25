import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
  users = [
    {
      id: 1,
      username: 'user1',
      password: 'hello1232',
    },

    {
      id: 2,
      username: 'user2 ',
      password: 'hello132',
    },

    {
      id: 1,
      username: 'user3 ',
      password: 'hello12324',
    },
    {
      id: 1,
      username: 'user4 ',
      password: 'hello12',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    const ans =  this.users.find((i) => i.username === username);
    console.log(ans)
    return ans; 
  }


  
}
