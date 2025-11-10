import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ 
    example: 'john@example.com',
    description: 'User email address'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({  
    example: 'password123', 
    minLength: 6,
    description: 'User password (minimum 6 characters)'
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    example: Role.DEVELOPER, 
    enum: Role,
    description: 'User role (developer or client)'
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
