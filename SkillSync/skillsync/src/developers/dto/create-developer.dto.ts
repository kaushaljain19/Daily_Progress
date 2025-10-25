import { IsNotEmpty, IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Experience } from '../../common/enums/experience.enum';

export class CreateDeveloperDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: ['React', 'Node.js', 'TypeScript'] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ example: Experience.MIDLEVEL, enum: Experience })
  @IsNotEmpty()
  @IsEnum(Experience)
  experienceLevel: Experience;

  @ApiProperty({ example: 'Full-stack developer', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}
