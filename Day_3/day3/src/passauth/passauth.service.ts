import { Injectable } from '@nestjs/common';
import { UsersauthService } from '../usersauth/usersauth.service';

@Injectable()
export class PassauthService {
  constructor(private usersauthService: UsersauthService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersauthService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
