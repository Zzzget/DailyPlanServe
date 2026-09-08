import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

interface JwtPayload {
  sub: string;
  email: string;
  nickname: string;
}

/**
 * JWT 验证策略：从请求头 Authorization: Bearer <token> 中取出 token，
 * 校验签名与是否过期（ignoreExpiration=false 表示会校验过期）。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret')!,
    });
  }

  /**
   * 校验通过后 passport 会调用此方法，返回值会挂到 request.user 上，
   * 供 @CurrentUser() 装饰器读取。
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      nickname: payload.nickname,
    };
  }
}
