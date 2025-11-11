import { Controller, Get, Param, HttpCode, HttpStatus,Query} from '@nestjs/common';
 import { EmpService } from './emp.service';
  import { EmployeeListResponseDto } from './dto/EmployeeListResponseDto.dto';
  import { EmployeeResponseDto } from './dto/EmployeeResponseDto.dto';

 @Controller('employees')
 export class EmpController {
  constructor(private readonly empService: EmpService) {}
  @Get()
  async getAll(@Query('page') page?: string): Promise<EmployeeListResponseDto> {

    const pageNumber = parseInt(page||'1') || 1;
    const result = await this.empService.findAll(pageNumber);

    return {
      message: 'Employees list fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    const employee = await this.empService.findOne(id);
    return {
      message: 'Employee details fetched successfully',
      data: employee,
    };
  }
 } 

