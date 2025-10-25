import { Module } from '@nestjs/common';
import { EmpService } from './emp.service';
import { EmpController } from './emp.controller';

@Module({
  controllers: [EmpController],
  providers: [EmpService],
})
export class EmpModule {}
