import { Module } from '@nestjs/common';
import { UsersauthService } from './usersauth.service';

@Module({
  providers: [UsersauthService],
  exports: [UsersauthService],
})
export class UsersauthModule {}
