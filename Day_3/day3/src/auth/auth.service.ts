import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtConst } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    // usersService function will return us a object on the basis of username

    const ans = await this.usersService.findOne(username);

    if (ans?.password !== pass) {
      throw new UnauthorizedException();
    }

    // let { password, ...result } = ans;

    // return result;

    const payload = {sub:ans.id, username:ans.username}

    return {
      acess_tocken: await this.jwtService.signAsync(payload)
    }
  }
}
