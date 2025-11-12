import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpModule } from './emp/emp.module';
import {ConfigModule} from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true,}),EmpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
