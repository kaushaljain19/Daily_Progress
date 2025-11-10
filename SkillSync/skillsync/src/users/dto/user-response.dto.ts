import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'user-uuid-123' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'developer', enum: ['developer', 'client'] })
  role: string;

  @ApiProperty({ example: '2025-10-27T10:00:00.000Z' })
  createdAt: Date;
}
