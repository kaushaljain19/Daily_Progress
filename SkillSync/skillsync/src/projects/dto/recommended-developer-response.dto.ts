import { ApiProperty } from '@nestjs/swagger';

class DeveloperSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty()
  experienceLevel: string;

  @ApiProperty()
  bio: string;
}

export class RecommendedDeveloperResponseDto {
  @ApiProperty({ type: DeveloperSummaryDto })
  developer: DeveloperSummaryDto;

  @ApiProperty({ type: [String], example: ['React', 'Node.js'] })
  matchedSkills: string[];

  @ApiProperty({ example: 75 })
  matchPercentage: number;
}
