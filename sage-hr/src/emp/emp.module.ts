import { Module } from '@nestjs/common';
import { EmpService } from './emp.service';
import { EmpController } from './emp.controller';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports:[ConfigModule],
  providers: [EmpService],
  controllers: [EmpController]
})
export class EmpModule {}
