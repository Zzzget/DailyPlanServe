import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 把 passport 的 'jwt' 策略封装成守卫，
 * 在需要登录的接口上用 @UseGuards(JwtAuthGuard) 标记即可。
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
