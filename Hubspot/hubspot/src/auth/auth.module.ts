import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token.storage';

@Module({
  imports: [ ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, TokenStorageService],
  exports: [AuthService],
})
export class AuthModule {}
