import { ApiProperty } from '@nestjs/swagger';

export class DeveloperResponseDto {
  @ApiProperty({ example: 'abc-123-def-456' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: ['React', 'Node.js', 'TypeScript'] })
  skills: string[];

  @ApiProperty({ example: 'midlevel', enum: ['junior', 'midlevel', 'senior'] })
  experienceLevel: string;

  @ApiProperty({ example: 'Full-stack developer with 3+ years experience', required: false })
  bio?: string;

  @ApiProperty({ example: '2025-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-27T10:00:00.000Z' })
  updatedAt: Date;
}
