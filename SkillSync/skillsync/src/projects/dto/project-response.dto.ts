import { ApiProperty } from '@nestjs/swagger';

class ClientInfoDto {
  @ApiProperty({ example: 'client-uuid-123' })
  id: string;

  @ApiProperty({ example: 'client@example.com' })
  email: string;

  @ApiProperty({ example: 'client' })
  role: string;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 'project-uuid-123' })
  id: string;

  @ApiProperty({ example: 'E-commerce Website Development' })
  title: string;

  @ApiProperty({ example: 'Build modern e-commerce platform with payment gateway' })
  description: string;

  @ApiProperty({ example: ['React', 'Node.js', 'MongoDB'] })
  requiredSkills: string[];

  @ApiProperty({ example: 5000, required: false })
  budget?: number;

  @ApiProperty({ example: '3 months', required: false })
  duration?: string;

  @ApiProperty({ example: 'open', enum: ['open', 'in_progress', 'completed', 'cancelled'] })
  status: string;

  @ApiProperty({ type: ClientInfoDto })
  client: ClientInfoDto;

  @ApiProperty({ example: '2025-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-27T10:00:00.000Z' })
  updatedAt: Date;
}
