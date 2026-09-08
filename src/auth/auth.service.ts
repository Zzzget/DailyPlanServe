import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '../common/constants/error-codes';
import { BusinessException } from '../common/exceptions/business.exception';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { HttpStatus } from '@nestjs/common';

const SALT_ROUNDS = 10;

/**
 * 认证服务：负责注册、登录，并签发 JWT。
 * 密码只存 bcrypt 哈希，绝不明文落库。
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 注册：校验邮箱唯一 → bcrypt 加密密码 → 创建用户 → 直接签发 token（注册即登录）。
   */
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BusinessException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        '该邮箱已被注册',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname,
    });

    return this.buildAuthResult(user.id, user.email, user.nickname);
  }

  /**
   * 登录：查询用户 + bcrypt 比对密码。
   * 用户不存在与密码错误返回同一文案，避免被枚举探测出哪些邮箱已注册。
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BusinessException(
        ErrorCode.INVALID_CREDENTIALS,
        '邮箱或密码错误',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new BusinessException(
        ErrorCode.INVALID_CREDENTIALS,
        '邮箱或密码错误',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.buildAuthResult(user.id, user.email, user.nickname);
  }

  /**
   * 生成登录凭证。JWT 的 sub 字段按规范存放用户 id，
   * email/nickname 一并写入方便前端展示，避免额外请求。
   */
  private buildAuthResult(sub: string, email: string, nickname: string) {
    const accessToken = this.jwtService.sign({ sub, email, nickname });
    return {
      accessToken,
      user: { id: sub, email, nickname },
    };
  }
}
