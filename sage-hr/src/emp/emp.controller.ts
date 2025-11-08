import { Controller, Get, Param } from '@nestjs/common';
import { EmpService } from './emp.service';

@Controller('employees')
export class EmpController {
  constructor(private readonly empService: EmpService) {}

  @Get()
  async getAll() {
    const result = await this.empService.findAll();
    return { message: 'Employees list fetched successfully', ...result };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const employee = await this.empService.findOne(id);
    return { message: `Employee ${id} details`, data: employee };
  }
}
