import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { Employees } from './interfaces/emp.interface';
import { differenceInYears, addYears, isBefore, parseISO } from 'date-fns';
import { JobDetailsResponse } from './dto/jobDetailsResponse.dto';
import { EmploymentDetailsResponse } from './dto/EmployementDetailsResponse.dto';
import { SageHREmployee } from './dto/SageHREmployee.dto';

const API_TIMEOUT = 15000;

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
      timeout: API_TIMEOUT,
    });
  }

  private formatDate(date?: string): string | null {
    if (!date) return null;
    try {
      return new Date(date).toISOString();
    } catch {
      return null;
    }
  }

  private calculateTenure(hireDate?: string): string {
    if (!hireDate) return '';
    try {
      const hire = parseISO(hireDate);
      const today = new Date();
      const years = differenceInYears(today, hire);
      return `${years} years`;
    } catch {
      return '';
    }
  }

  private calculateUpcomingBirthday(dateOfBirth?: string): string | null {
    if (!dateOfBirth) return null;
    try {
      const dob = parseISO(dateOfBirth);
      const today = new Date();
      let upcoming = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate(),
      );
      if (isBefore(upcoming, today)) {
        upcoming = addYears(upcoming, 1);
      }
      return upcoming.toISOString();
    } catch {
      return null;
    }
  }

  private async fetchJobDetails(
    positionId?: number,
  ): Promise<JobDetailsResponse | null> {
    if (!positionId) return null;

    try {
      
      const response = await this.axiosInstance.get(`/positions/${positionId}`);
      const position = response.data.data;

      if (position) {
        return {
          title: position.name || position.title,
          description: position.description || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private async fetchEmploymentDetails(
    empId?: number,
  ): Promise<EmploymentDetailsResponse | null> {
    if (!empId) return null;

    try {
      const response = await this.axiosInstance.get(
        `/employees/${empId}/compensations`,
      );
      const compensation = response.data.data?.[0];

      if (compensation) {
        return {
          effective_date: compensation.effective_date,
          salary: compensation.amount || compensation.salary,
          employment_type: compensation.type || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private async mapEmployee(raw: SageHREmployee): Promise<Employees> {
    const jobDetails = await this.fetchJobDetails(raw.position_id);
    const empDetails = await this.fetchEmploymentDetails(raw.id);

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
      Phone_number:
        raw.work_phone || raw.mobile_phone || raw.home_phone || null,
      Hire_date: this.formatDate(raw.employment_start_date),
      Start_date: this.formatDate(raw.employment_start_date),
      Termination_date: this.formatDate(raw.termination_date),
      Tenure: this.calculateTenure(raw.employment_start_date),
      Job: {
        Title: jobDetails?.title || raw.position || null,
        Description: jobDetails?.description || null,
        Id: raw.position_id?.toString() || null,
      },
      Employments: {
        Effective_date: this.formatDate(
          empDetails?.effective_date || raw.employment_start_date,
        ),
        Salary: empDetails?.salary?.toString() || null,
        Employment_type:
          empDetails?.employment_type || raw.employment_status || null,
      },
    };
  }

  async findAll(page: number = 1): Promise<{ data: Employees[]; meta: any }> {
    try {
      const response = await this.axiosInstance.get(
        `/employees?page=${page}&team_history=true&employment_status_history=true&position_history=true`,
      );
      const employeesRaw: SageHREmployee[] = response.data.data;
      const meta = response.data.meta;

      const employeesMapped = await Promise.all(
        employeesRaw.map((emp) => this.mapEmployee(emp)),
      );

      return { data: employeesMapped, meta };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new HttpException(
          `Failed to fetch employees: ${axiosError.message}`,
          axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Failed to fetch employees',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Employees> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Employee ID is required');
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid employee ID format');
    }

    try {
      const response = await this.axiosInstance.get(
        `/employees/${id}?team_history=true&employment_status_history=true&position_history=true`,
      );
      const empRaw: SageHREmployee = response.data.data;
      return await this.mapEmployee(empRaw);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 404) {
          throw new HttpException(
            `Employee with ID ${id} not found`,
            HttpStatus.NOT_FOUND,
          );
        }

        throw new HttpException(
          `Failed to fetch employee: ${axiosError.message}`,
          axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Failed to fetch employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
