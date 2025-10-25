import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmpModule } from './emp/emp.module';
import { PassauthModule } from './passauth/passauth.module';
import { UsersauthModule } from './usersauth/usersauth.module';


@Module({
  imports: [AuthModule, UsersModule, EmpModule, PassauthModule, UsersauthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

