import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { AccountsModule } from './accounts/accounts.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }), ContactsModule , HttpModule, AccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

