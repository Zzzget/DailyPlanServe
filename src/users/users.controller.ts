import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 通过 id 查询用户；ParseUUIDPipe 会在进入前校验 id 是否为合法 UUID
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    // 只返回脱敏后的公开字段，避免泄露 passwordHash
    return this.usersService.toPublic(user);
  }
}
