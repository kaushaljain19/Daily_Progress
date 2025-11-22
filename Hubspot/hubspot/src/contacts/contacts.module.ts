import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    HttpModule,
    ConfigModule, 
    AuthModule,   
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
