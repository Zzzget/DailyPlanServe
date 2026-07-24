import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
