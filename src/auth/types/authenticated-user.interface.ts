/**
 * 当前登录用户信息：由 JwtStrategy.validate 生成，挂在 request.user 上。
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  nickname: string;
}
