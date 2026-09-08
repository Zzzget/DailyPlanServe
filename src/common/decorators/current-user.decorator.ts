import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

/**
 * 参数装饰器：从 request.user 中取出当前登录用户。
 * 配合 JwtAuthGuard 使用，如 `foo(@CurrentUser() user: AuthenticatedUser)`。
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
