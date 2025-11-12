import { IsDateString, IsOptional } from 'class-validator';
import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // url will always send string, so convert to number
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsDateString()
  created_after?: string;

  @IsOptional()
  @IsDateString()
  updated_after?: string;
}
