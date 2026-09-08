import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BillType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/** 常用分类常量，前端可用作默认选项，实际存储为字符串支持自定义 */
export const BILL_CATEGORIES = {
  income: ['工资', '奖金', '兼职', '理财', '红包', '其他收入'],
  expense: [
    '餐饮',
    '交通',
    '购物',
    '住房',
    '娱乐',
    '医疗',
    '教育',
    '通讯',
    '其他支出',
  ],
};

/**
 * 账单实体，映射数据库表 bill_records。
 * userId 字段用于数据隔离，保证每笔账单归属明确。
 */
@Entity('bill_records')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 归属用户，所有查询都以此过滤
  @Index()
  @Column({ name: 'user_id', length: 36 })
  userId: string;

  // 与 User 实体的外键关系，删除用户时级联删除其账单
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column({ type: 'enum', enum: BillType })
  type: BillType;

  // 金额用 decimal 存储，避免浮点精度问题
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 50 })
  category: string;

  @Index()
  @Column({ name: 'record_date', type: 'date' })
  recordDate: string;

  @Column({ length: 200, nullable: true })
  note?: string;

  // 由 TypeORM 自动维护的创建/更新时间
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
