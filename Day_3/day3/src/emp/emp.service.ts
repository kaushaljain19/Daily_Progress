import { Injectable } from '@nestjs/common';
import { CreateEmpDto } from './dto/create-emp.dto';
import { UpdateEmpDto } from './dto/update-emp.dto';

@Injectable()
export class EmpService {
  create(createEmpDto: CreateEmpDto) {
    return 'This action adds a new emp';
  }

  findAll() {
    return `This action returns all emp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} emp`;
  }

  update(id: number, updateEmpDto: UpdateEmpDto) {
    return `This action updates a #${id} emp`;
  }

  remove(id: number) {
    return `This action removes a #${id} emp`;
  }
}
