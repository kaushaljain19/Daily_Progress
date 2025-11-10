import { IsNotEmpty, IsString, IsArray, IsEnum, IsOptional ,ArrayNotEmpty,MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Experience } from '../../common/enums/experience.enum';

export class CreateDeveloperDto {
  @ApiProperty({ 
    example: 'John Doe',
    description: 'Developer full name'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    example: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    description: 'List of developer technical skills',
    type: [String]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'Skills array cannot be empty' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  @MinLength(1, { each: true, message: 'Each skill must not be empty' })
  skills: string[];

  @ApiProperty({ 
    example: Experience.MIDLEVEL, 
    enum: Experience,
    description: 'Developer experience level (junior, midlevel, or senior)'
  })
  @IsNotEmpty()
  @IsEnum(Experience)
  experienceLevel: Experience;

  @ApiProperty({ 
    example: 'Passionate full-stack developer with 3+ years of experience in modern web technologies',
    description: 'Developer biography and background',
    required: false 
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
