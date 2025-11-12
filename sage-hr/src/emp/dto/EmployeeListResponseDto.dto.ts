import { Employees } from '../interfaces/emp.interface';
// Response DTOs for better type safety
export class EmployeeListResponseDto {
  message: string;
  data: Employees[];
  meta: any;
}
