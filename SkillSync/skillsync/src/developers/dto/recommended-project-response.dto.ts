import { ApiProperty } from '@nestjs/swagger';

class ProjectSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  requiredSkills: string[];

  @ApiProperty()
  budget: number;

  @ApiProperty()
  duration: string;
}

export class RecommendedProjectResponseDto {
  @ApiProperty({ type: ProjectSummaryDto })
  project: ProjectSummaryDto;

  @ApiProperty({ type: [String], example: ['React', 'Node.js'] })
  matchedSkills: string[];

  @ApiProperty({ example: 75 })
  matchPercentage: number;
}
