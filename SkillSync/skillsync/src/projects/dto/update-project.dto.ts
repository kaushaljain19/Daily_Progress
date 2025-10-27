import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../common/enums/project-status.enum';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ example: ProjectStatus.OPEN, enum: ProjectStatus, required: false })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
