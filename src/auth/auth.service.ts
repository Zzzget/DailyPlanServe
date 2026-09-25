import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes';
import { BusinessException } from '../common/exceptions/business.exception';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

const SALT_ROUNDS = 10;

/**
 * 认证服务：负责注册、登录、刷新与登出，签发双 token。
 * - access token：短期 JWT，无状态，仅用于访问业务接口
 * - refresh token：长期 JWT（独立密钥），sha256 哈希落库，支持轮换与撤销
 * 密码只存 bcrypt 哈希，绝不明文落库。
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
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
   * 刷新：校验 refresh token（签名 + 库中记录）→ 吊销旧 token → 轮换签发新的一对。
   * 若收到已吊销的旧 token，视为泄露重放，吊销该用户全部 refresh token，强制重新登录。
   */
  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash: this.hashToken(refreshToken) },
    });

    if (!record || record.expiresAt < new Date()) {
      throw this.invalidRefreshToken();
    }

    if (record.revoked) {
      // 旧 token 被重复使用，疑似泄露：吊销该用户所有会话
      await this.refreshTokenRepository.update(
        { userId: record.userId },
        { revoked: true },
      );
      throw this.invalidRefreshToken();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw this.invalidRefreshToken();
    }

    // 轮换：先吊销旧 token，再签发新的一对
    record.revoked = true;
    await this.refreshTokenRepository.save(record);

    return this.buildAuthResult(user.id, user.email, user.nickname);
  }

  /**
   * 登出：吊销对应的 refresh token。
   * 登出是幂等操作，token 不存在时也静默成功，不向前端暴露细节。
   */
  async logout(refreshToken: string) {
    await this.refreshTokenRepository.update(
      { tokenHash: this.hashToken(refreshToken) },
      { revoked: true },
    );
    return { success: true };
  }

  /**
   * 生成登录凭证：短期 access token + 长期 refresh token（哈希落库）。
   * JWT 的 sub 字段按规范存放用户 id，email/nickname 一并写入方便前端展示，
   * type 用于区分两种 token，防止 refresh token 被拿去访问业务接口。
   */
  private async buildAuthResult(sub: string, email: string, nickname: string) {
    const accessToken = this.jwtService.sign({
      sub,
      email,
      nickname,
      type: 'access',
    });
    const refreshToken = await this.issueRefreshToken(sub);
    return {
      accessToken,
      refreshToken,
      user: { id: sub, email, nickname },
    };
  }

  /**
   * 签发 refresh token 并把它的 sha256 哈希落库（用于撤销与轮换）。
   * 过期时间直接取 JWT 的 exp，避免重复解析配置。
   */
  private async issueRefreshToken(sub: string): Promise<string> {
    const token = await this.jwtService.signAsync(
      { sub, type: 'refresh' },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: (this.config.get<string>('jwt.refreshExpiresIn') ??
          '7d') as StringValue,
      },
    );

    const decoded = this.jwtService.decode<{ exp: number }>(token);
    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: sub,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(decoded.exp * 1000),
      }),
    );
    return token;
  }

  /** 校验 refresh token 的签名、有效期与类型 */
  private async verifyRefreshToken(
    token: string,
  ): Promise<{ sub: string; type?: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type?: string;
      }>(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      if (payload.type !== 'refresh') {
        throw new Error('not a refresh token');
      }
      return payload;
    } catch {
      throw this.invalidRefreshToken();
    }
  }

  private invalidRefreshToken() {
    return new BusinessException(
      ErrorCode.INVALID_REFRESH_TOKEN,
      '登录状态已失效，请重新登录',
      HttpStatus.UNAUTHORIZED,
    );
  }

  /** sha256 哈希 refresh token，数据库只存哈希不存明文 */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
