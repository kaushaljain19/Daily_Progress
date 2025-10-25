import { Module } from '@nestjs/common';
import { PassauthService } from './passauth.service';
import { UsersauthModule } from '../usersauth/usersauth.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersauthModule, PassportModule],
  providers: [PassauthService, LocalStrategy],
})
export class PassauthModule {}
