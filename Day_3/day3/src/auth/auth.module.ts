import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule} from '../users/users.module'
import {JwtModule} from '@nestjs/jwt'
import {JwtConst} from './auth.constants'
@Module({
  imports : [UsersModule,JwtModule.register({
      global: true,
      secret: JwtConst.secret,
      signOptions: { expiresIn: '60s' },
    })],
  providers: [AuthService],
  controllers: [AuthController] 

})
export class AuthModule {}
