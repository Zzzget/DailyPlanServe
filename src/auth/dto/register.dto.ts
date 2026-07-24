import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty()
  @IsString()
  @Length(6, 32, { message: '密码长度需在 6~32 位之间' })
  password: string;

  @ApiProperty()
  @IsString()
  @Length(1, 50, { message: '昵称长度需在 1~50 位之间' })
  nickname: string;
}
