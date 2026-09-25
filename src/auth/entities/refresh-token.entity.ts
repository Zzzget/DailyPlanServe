import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Refresh Token 落库记录，映射数据库表 refresh_tokens。
 * 只存 token 的 sha256 哈希，即使数据库泄露也无法伪造登录态；
 * revoked 标记配合「轮换 + 重用检测」：旧 token 被再次使用说明可能已泄露。
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', length: 36 })
  userId: string;

  // refresh token 的 sha256 哈希（64 位十六进制）
  @Index()
  @Column({ name: 'token_hash', length: 64 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
