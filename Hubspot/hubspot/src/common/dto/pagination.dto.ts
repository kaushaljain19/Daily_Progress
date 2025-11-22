import { IsOptional, IsInt, Min, Max, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  after?: string;

  @IsOptional()
  @IsDateString()
  created_after?: string;

  @IsOptional()
  @IsDateString()
  updated_after?: string;
}
