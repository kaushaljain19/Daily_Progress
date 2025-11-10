import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'E-commerce Website Development' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Need a full-stack developer to build an e-commerce platform with payment integration',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: ['React', 'Node.js', 'MongoDB', 'Stripe'] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiProperty({ example: '3 months', required: false })
  @IsOptional()
  @IsString()
  duration?: string;
}
