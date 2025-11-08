import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Employees } from './interfaces/emp.interface';
import { differenceInYears, addYears, isBefore, parseISO } from 'date-fns';

@Injectable()
export class EmpService {
  private axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create({
      baseURL: this.configService.get<string>('SAGEHR_BASE_URL'),
      headers: {
        'X-Auth-Token': this.configService.get<string>('SAGEHR_API_KEY'),
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  private formatDate(date?: string): string | null {
    if (!date) return null;
    return new Date(date).toISOString();
  }

  private calculateTenure(hireDate?: string): string {
    if (!hireDate) return '';
    const hire = parseISO(hireDate);
    const today = new Date();
    const years = differenceInYears(today, hire);
    return `${years} years`;
  }

  private calculateUpcomingBirthday(dateOfBirth?: string): string | null {
    if (!dateOfBirth) return null;
    const dob = parseISO(dateOfBirth);
    const today = new Date();
    let upcoming = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (isBefore(upcoming, today)) {
      upcoming = addYears(upcoming, 1);
    }
    return upcoming.toISOString();
  }

  private mapEmployee(raw: any): Employees {
    return {
      Id: raw.id?.toString() || '',
      First_name: raw.first_name || '',
      Last_name: raw.last_name || '',
      Full_name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
      Display_name: raw.first_name || '',
      Avatar_url: raw.picture_url || null,
      Date_of_birth: this.formatDate(raw.date_of_birth),
      Upcoming_birthday_date: this.calculateUpcomingBirthday(raw.date_of_birth),
      Email: raw.email || '',
      Phone_number: raw.work_phone || null,
      Hire_date: this.formatDate(raw.employment_start_date),
      Start_date: this.formatDate(raw.employment_start_date),
      Termination_date: this.formatDate(raw.termination_date),
      Tenure: this.calculateTenure(raw.employment_start_date),
      Job: {
        Title: raw.position || null,
        Description: null,
        Id: raw.position_id?.toString() || null,
      },
      Employments: {
        Effective_date: this.formatDate(raw.employment_start_date),
        Salary: null,
        Employment_type: raw.employment_status || null,
      },
    };
  }

  async findAll(): Promise<{ data: Employees[]; meta: any }> {
    try {
      const response = await this.axiosInstance.get('/employees?page=1&team_history=true&employment_status_history=true&position_history=true');
      const employeesRaw = response.data.data;
      const meta = response.data.meta;
      const employeesMapped = employeesRaw.map(emp => this.mapEmployee(emp));
      return { data: employeesMapped, meta };
    } catch (error) {
      throw new HttpException('Failed to fetch employees', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Employees> {
    try {
      const response = await this.axiosInstance.get(`/employees/${id}?team_history=true&employment_status_history=true&position_history=true`);
      const empRaw = response.data.data;
      return this.mapEmployee(empRaw);
    } catch (error) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
  }
}
